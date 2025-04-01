import React from 'react'
import { AiOutlineCloudUpload } from 'react-icons/ai';
const UploadFiles = ({ onDragOver, onDrop, onUpload, onExample }) => {

    const inputRef = React.useRef(null);

    const handleDragOver = (event) => {
        if (typeof onDragOver === "function") {
            onDragOver(event);
        }
    };

    const handleDrop = (event) => {
        if (typeof onDrop === "function") {
            onDrop(event);
        }
    }

    const handleUpload = (event) => {
        if (typeof onUpload === "function") {
            onUpload(event);
        }
    }

    const handleExample = (event) => {
        if (typeof onExample === "function") {
            onExample(event);
        }
    }


    return (
        <div className='w-96 flex flex-col items-center bg-white rounded-lg overflow-hidden'>
            <AiOutlineCloudUpload size={60} className='mb-4 mt-8 text-gray-600' />
            <div className='text-center w-full px-8 mb-16' onDragOver={handleDragOver} onDrop={handleDrop}>
                <h3 className='text-base text-gray-700 font-thin mb-2'>Supporting Format (.XLS/JSON...)</h3>
                <div className='w-full border-dashed border rounded border-gray-400 px-8 py-10 text-sm font-thin text-gray-700'>
                    <p>Drag file here</p>
                    <p>Or</p>
                    <input type="file" multiple onChange={handleUpload} hidden ref={inputRef} />
                    <p>
                        <a onClick={() => inputRef.current.click()} className='text-[#3182CE] font-normal underline cursor-pointer' >Upload</a> your file
                    </p>
                    <p>Or</p>
                    <p className='text-[#3182CE] font-normal underline cursor-pointer' onClick={handleExample}>Use example file</p>
                </div>
            </div>
            <a href="" className='bg-[#8D6CBB] hover:bg-[#735AA7] w-full text-center text-white font-semibold py-3'>Submit</a>
        </div>
    )
}

export default UploadFiles