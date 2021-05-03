import {annotationType, labelType} from "../App";
import {useEffect, useState} from "react";
import EntItem from "../EntItem/EntItem";
import 'antd/dist/antd.css';
import './index.css'
import {Dropdown, Menu} from "antd";

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
    const [position, setPosition] = useState({start: 0, end: 0, x: 0, y: 0, showMenu: false});

    console.log('update', entities)


    useEffect(() => {
        setRenderChunks(chunks())
        let cls = document.getElementsByClassName("highlight-container highlight-container--bottom-labels")
        cls[0].addEventListener('mouseup', handleOpen)
        return () => {
            cls[0].removeEventListener('mouseup', handleOpen)
        }
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
    const show = (e: any, start_: number, end_: number) => {
        e.preventDefault()
        let tmp = {
            start: start_,
            end: end_,
            x: e.clientX || e.changedTouches[0].clientX,
            y: e.clientY || e.changedTouches[0].clientY,
            showMenu: true
        }
        setPosition(tmp)
        // setShowMenu(true)
    }
    const setSpanInfo = (e: any) => {
        let selection
        // Modern browsers.
        if (window.getSelection) {
            selection = window.getSelection()
        } else if (document.getSelection()) {
            selection = document.getSelection()
        }
        if (!selection || e.target.className !== 'highlight-container highlight-container--bottom-labels') {
            return {start_: 0, end_: 0}
        }

        const range = selection.getRangeAt(0)
        const preSelectionRange = range.cloneRange()
        preSelectionRange.selectNodeContents(e.target)
        preSelectionRange.setEnd(range.startContainer, range.startOffset)
        let start_ = [...preSelectionRange.toString()].length
        let end_ = start_ + [...range.toString()].length

        // start = start_
        // end = end_
        // x = e.clientX || e.changedTouches[0].clientX
        // y = e.clientY || e.changedTouches[0].clientY
        // setStart(start_)
        // setEnd(end_)
        // setX(e.clientX || e.changedTouches[0].clientX)
        // setY(e.clientY || e.changedTouches[0].clientY)
        return {start_, end_}
    }
    const validateSpan = (start_: number | undefined = 0, end_: number | undefined = 0) => {
        if ((typeof start_ === 'undefined') || (typeof end_ === 'undefined') || (end_ === 0)) {
            setPosition({...position, showMenu: false})
            return false
        }
        if (start_ === end_) {
            setPosition({...position, showMenu: false})
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
    const handleOpen = (e: any) => {
        let deleteElem = e.path.filter((elem: any) => elem.className === 'delete')
        if (deleteElem.length !== 0) {
            let id_ = Number(deleteElem[0].name.replace('close', ''))
            deleteAnnotation(id_)
        } else {
            console.log('open trigger', e)
            let {start_, end_} = setSpanInfo(e)
            if (validateSpan(start_, end_)) {
                show(e, start_, end_)
            }
        }
    }
    // const assignLabel = (labelId: number) => {
    //     if (validateSpan()) {
    //         addEntity(start, end, labelId)
    //         setShowMenu(false)
    //         // setStart(0)
    //         // setEnd(0)
    //         x = 0
    //         y = 0
    //     }
    // }

    return <div className={"highlight-container highlight-container--bottom-labels"}>
        {renderChunks.map(chunk => {
            if (chunk.color) return <EntItem key={chunk.id} labels={labels} label={chunk.label} color={chunk.color}
                                             content={chunk.text} deleteAnnotation={deleteAnnotation} item_id={chunk.id}
                                             newline={true}/>
            return chunk.text
        })}
        <Dropdown overlay={<Menu style={{position: 'fixed', top: `${position.y}px`, left: `${position.x}px`}}>
            {labels.map(item => <Menu.Item key={item.id} onClick={() => {
                addEntity(position.start, position.end, item.id);
                setPosition({...position, showMenu: false})
            }}>
                {item.text}
            </Menu.Item>)}
        </Menu>} placement="bottomLeft" visible={position.showMenu}>
            <div/>
        </Dropdown>
    </div>

}