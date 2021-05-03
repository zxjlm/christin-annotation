import './index.css'
import {CloseOutlined} from "@ant-design/icons";
import {labelType} from "../App";

interface EntItemProps {
    content: string
    label: string | null
    color: string
    labels: labelType[]
    newline: boolean
    deleteAnnotation: (annotationId: number) => void
    item_id: number | undefined
}

export default ({content, label, color, labels, newline, deleteAnnotation, item_id}: EntItemProps) => {

    const idealColor = function (hexString: string) {
        const r = parseInt(hexString.substr(1, 2), 16)
        const g = parseInt(hexString.substr(3, 2), 16)
        const b = parseInt(hexString.substr(5, 2), 16)
        return ((((r * 299) + (g * 587) + (b * 114)) / 1000) < 128) ? '#ffffff' : '#000000'
    }

    const onClick = () => {
        // if (item_id) deleteAnnotation(item_id)
    }

    return <span className="highlight bottom" style={{borderColor: color}}>
            <span className="highlight__content">
                {content}
                <button type="button" className={'delete'} onClick={onClick} name={`close${item_id}`}><CloseOutlined/></button>
            </span>
            <span data-label={label} className="highlight__label"
                  style={{backgroundColor: color, color: idealColor(color)}}>
            </span>
        </span>
}