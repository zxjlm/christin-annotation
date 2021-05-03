import {annotationType, labelType} from "../App";
import {useEffect, useState} from "react";
import EntItem from "../EntItem/EntItem";
import 'antd/dist/antd.css';
import './index.css'
import {Button, Dropdown, Menu} from "antd";

interface EntItemBoxProps {
    "labels": labelType[]
    "text": string
    "entities": annotationType[]
    "deleteAnnotation": (annotationId: number) => void
    "updateEntity": (labelId: number, annotationId: number) => void
    "addEntity": (start: number, end: number, labelId: number) => void
}

interface chunkState {
    id?: number,
    label: string | null,
    color: string,
    text: string,
    newline?: boolean
}


export default ({labels, text, entities, deleteAnnotation, updateEntity, addEntity}: EntItemBoxProps) => {
    const [renderChunks, setRenderChunks] = useState<chunkState[]>([]);
    const [showMenu, setShowMenu] = useState(false);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(0);

    useEffect(() => {
        let chunk = chunks()
        setRenderChunks(chunk)
        // document.addEventListener('mouseup',(e) => {debugger;console.log(e)})
        let cls = document.getElementsByClassName("highlight-container highlight-container--bottom-labels")
        if (cls)
            cls[0].addEventListener('mouseup', open)
        console.log('cls', cls)
    }, [entities]);

    const sortedEntities: () => annotationType[] = () => {
        return entities.slice().sort((a: { startOffset: number; }, b: { startOffset: number; }) => a.startOffset - b.startOffset)
    }
    const labelObject: () => { [index: string]: { text: string, backgroundColor: string } } = () => {
        const obj: any = {}
        for (const label of labels) {
            obj[label.id] = label
        }
        return obj
    }
    const chunks: () => chunkState[] = () => {
        let chunks: any[] = []
        let startOffset = 0
        // to count the number of characters correctly.
        const characters = [...text]
        for (const entity of sortedEntities()) {
            // add non-entities to chunks.
            let piece = characters.slice(startOffset, entity.startOffset).join('')
            chunks = chunks.concat(makeChunks(piece))
            startOffset = entity.endOffset
            // add entities to chunks.
            const label = labelObject()[entity.label]
            piece = characters.slice(entity.startOffset, entity.endOffset).join('')
            chunks.push({
                id: entity.id,
                label: label.text,
                color: label.backgroundColor,
                text: piece
            })
        }
        // add the rest of text.
        chunks = chunks.concat(makeChunks(characters.slice(startOffset, characters.length).join('')))
        return chunks
    }


    const makeChunks = (text: string) => {
        const chunks = []
        const snippets = text.split('\n')
        for (const snippet of snippets.slice(0, -1)) {
            chunks.push({
                label: null,
                color: null,
                text: snippet + '\n',
                newline: false
            })
            chunks.push({
                label: null,
                color: null,
                text: '',
                newline: true
            })
        }
        chunks.push({
            label: null,
            color: null,
            text: snippets.slice(-1)[0],
            newline: false
        })
        return chunks
    }
    const show = (e: any) => {
        e.preventDefault()
        setShowMenu(true)
        setX(e.clientX || e.changedTouches[0].clientX)
        setY(e.clientY || e.changedTouches[0].clientY)
        console.log('123')
        // this.$nextTick(() => {
        //     this.showMenu = true
        // })
    }
    const setSpanInfo = (e: any) => {
        let selection
        // Modern browsers.
        if (window.getSelection) {
            selection = window.getSelection()
        } else if (document.getSelection()) {
            selection = document.getSelection()
        }
        if (!selection || e.target.className !== 'highlight-container highlight-container--bottom-labels') return {
            start,
            end
        }

        const range = selection.getRangeAt(0)
        const preSelectionRange = range.cloneRange()
        preSelectionRange.selectNodeContents(e.target)
        preSelectionRange.setEnd(range.startContainer, range.startOffset)
        let start_ = [...preSelectionRange.toString()].length
        let end_ = start + [...range.toString()].length
        setStart(start_)
        setEnd(end_)
        return {start_, end_}
    }
    const validateSpan = (start_: number | undefined = start, end_: number | undefined = end) => {
        if ((typeof start_ === 'undefined') || (typeof end_ === 'undefined') || (end_ === 0)) {
            setShowMenu(false)
            return false
        }
        if (start_ === end_) {
            setShowMenu(false)
            return false
        }
        for (const entity of entities) {
            if ((entity.startOffset <= start_) && (start_ < entity.endOffset)) {
                return false
            }
            if ((entity.startOffset < end_) && (end_ <= entity.endOffset)) {
                return false
            }
            if ((start_ < entity.startOffset) && (entity.endOffset < end_)) {
                return false
            }
        }
        return true
    }
    const open = (e: any) => {
        let {start_, end_} = setSpanInfo(e)
        if (validateSpan(start_, end_)) {
            show(e)
        }
    }
    const assignLabel = (labelId: number) => {
        if (validateSpan()) {
            addEntity(start, end, labelId)
            setShowMenu(false)
            setStart(0)
            setEnd(0)
        }
    }

    return <div className={"highlight-container highlight-container--bottom-labels"}>
        {renderChunks.map(chunk => {
            if (chunk.color) return <EntItem key={chunk.id} labels={labels} label={chunk.label} color={chunk.color}
                                             content={chunk.text}
                                             newline={true}/>
            return chunk.text
        })}
        <Dropdown overlay={<Menu style={{position: 'fixed', top: `${y}px`, left: `${x}px`}}>
            {labels.map(item => <Menu.Item key={item.id} onClick={() => {
                addEntity(start, start + end, item.id);
                setShowMenu(false)
            }}>
                {item.text}
            </Menu.Item>)}
        </Menu>} placement="bottomLeft" visible={showMenu}>
            <div/>
        </Dropdown>
    </div>

}