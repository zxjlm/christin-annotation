import './index.css'
import {CloseOutlined} from "@ant-design/icons";
import {labelType} from "../App";
import {Dropdown, Menu} from "antd";
import {useState} from "react";

interface EntItemProps {
    content: string
    label: string | null
    color: string
    labels: labelType[]
    newline: boolean
    "updateEntity": (labelId: number, annotationId: number) => void
    item_id: number | undefined
}

export default ({content, label, color, labels, newline, updateEntity, item_id}: EntItemProps) => {
    const [showMenu, setShowMenu] = useState(false);

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
                <button type="button" className={'delete'} onClick={onClick}
                        name={`close${item_id}`}><CloseOutlined/></button>
            </span>
        <Dropdown overlay={<Menu>
            {labels.map(item => <Menu.Item key={item.id} onClick={() => {
                if (item_id) {
                    updateEntity(item.id, item_id)
                }
                setShowMenu(false)
            }}>
                {item.text}
            </Menu.Item>)}
        </Menu>} placement="bottomLeft" visible={showMenu}>
            <span data-label={label} className="highlight__label"
                  style={{backgroundColor: color, color: idealColor(color)}} onClick={() => setShowMenu(true)}>
            </span>
        </Dropdown>

        </span>
}