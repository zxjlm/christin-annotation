import React, {useState} from 'react';
import './index.css'
import EntItemBox from "./EntItemBox/EntItemBox";

export interface labelType {
    id: number,
    text: string,
    prefixKey: null,
    suffixKey: string,
    backgroundColor: string,
    textColor: string
}

export interface annotationType {
    id: number,
    label: number,
    startOffset: number,
    endOffset: number,
}

interface currentDocState {
    id: number,
    text: string,
    annotations: annotationType[],
}

function App() {
    const labels = [
        {
            id: 4,
            text: 'LOC',
            prefixKey: null,
            suffixKey: 'l',
            backgroundColor: '#7c20e0',
            textColor: '#ffffff'
        },
        {
            id: 5,
            text: 'MISC',
            prefixKey: null,
            suffixKey: 'm',
            backgroundColor: '#fbb028',
            textColor: '#000000'
        },
        {
            id: 6,
            text: 'ORG',
            prefixKey: null,
            suffixKey: 'o',
            backgroundColor: '#e6d176',
            textColor: '#000000'
        },
        {
            id: 7,
            text: 'PER',
            prefixKey: null,
            suffixKey: 'p',
            backgroundColor: '#6a74b9',
            textColor: '#ffffff'
        }
    ]
    const text = 'After bowling Somerset out for 83 on the opening morning at Grace Road , Leicestershire extended their first innings by 94 runs before being bowled out for 296 with England discard Andy Caddick taking three for 83 .'
    const annotationsTMP = [
        {
            id: 17,
            label: 4,
            startOffset: 60,
            endOffset: 70,
        },
        {
            id: 19,
            label: 4,
            startOffset: 165,
            endOffset: 172,
        },
        {
            id: 16,
            label: 6,
            startOffset: 14,
            endOffset: 22,
        },
        {
            id: 18,
            label: 6,
            startOffset: 73,
            endOffset: 87,
        },
        {
            id: 20,
            label: 7,
            startOffset: 181,
            endOffset: 193,
        }
    ]

    const [annotations, setAnnotations] = useState<annotationType[]>(annotationsTMP);

    console.log('update', annotations)


    const removeEntity = (annotationId: number) => {
        let tmp = annotations.filter(item => item.id !== annotationId)
        setAnnotations(tmp)
    }
    const updateEntity = (labelId: number, annotationId: number) => {
        let tmp = [...annotations]
        const index = annotations.findIndex(item => item.id === annotationId)
        tmp[index].label = labelId
        setAnnotations(tmp)
    }
    const addEntity = (startOffset: any, endOffset: any, labelId: any) => {
        const payload: annotationType = {
            id: Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER)),
            startOffset,
            endOffset,
            label: labelId
        }
        setAnnotations([...annotations, payload])
        // currentDoc.annotations.push(payload as annotationType)
    }

    return (
        <div>
            <EntItemBox text={text} labels={labels}
                        entities={annotations}
                        deleteAnnotation={removeEntity}
                        updateEntity={updateEntity}
                        addEntity={addEntity}
            />
        </div>
    );
}

export default App;
