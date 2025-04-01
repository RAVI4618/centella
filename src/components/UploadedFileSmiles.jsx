

import React from 'react'
import { AiFillDelete } from 'react-icons/ai'

const UploadedFileStrings = ({ smileStrings, onRemoveSmileString, onChangeSmileString, onSelectAllSimleStrings, isStringSelected, predictSelected, clearResults }) => {

    const handleRemoveSmileString = (index) => {
        if (typeof onRemoveSmileString === "function") {
            onRemoveSmileString(index)
        }
    }

    const handleChangeSmileString = (index) => {
        if (typeof onChangeSmileString === "function") {
            onChangeSmileString(index)
        }
    }

    const handleSelectAll = (checkEvent) => {
        if (typeof onSelectAllSimleStrings === "function") {
            onSelectAllSimleStrings(checkEvent.target.checked)
        }
    }

    function handleIsStringSelected(index) {
        if (typeof isStringSelected === "function") {
            return isStringSelected(index)
        }
    }

    function handlePredictSelected() {
        if (typeof predictSelected === "function") {
            predictSelected()
        }
    }

    function handleClearResults() {
        if (typeof clearResults === "function") {
            clearResults()
        }
    }

  	

    return (
        <div className='w-96 flex flex-col items-center bg-white rounded-lg overflow-hidden'>
            <div className='w-full px-6 flex flex-row justify-between py-4 bg-gray-300'>
                <div>
                    {/* Select All */}
                    <input type="checkbox" onChange={handleSelectAll} className='accent-lime-600 checked:bg-lime-600' />
                    <span className='text-sm text-dark font-normal ml-2'>Select All ({smileStrings.length})</span>
                </div>
                <div>
                    <button className='flex flex-row items-center bg-danger-300 text-danger-700 font-semibold text-sm py-1 px-2 rounded-md' 
                    
                    onClick={handleClearResults}
                    >
                        Clear All

                        <AiFillDelete size={16} className='ml-2' />
                    </button>
                </div>
            </div>

            <ul className='w-full text-sm max-h-96 overflow-auto'>
                {Array.from(smileStrings).map((smileString, index) => {
                    return <li key={index}  >
                        <div className='w-full px-6 mt-4 mb-6 flex flex-row items-center'>
                            <input type="checkbox" className='mr-6 accent-lime-600 checked:bg-lime-600' checked={handleIsStringSelected(index)} onChange={(event) => handleChangeSmileString(index)} />
                            <p className='w-60 break-words'>{smileString}</p>
                            <AiFillDelete size={16} className='ml-6 cursor-pointer' onClick={() => handleRemoveSmileString(index)} />
                        </div>
                        <div className='border border-dashed'></div>
                    </li>
                })}
            </ul>
            <button className='bg-[#735DA8] w-full text-center text-white font-thin py-3' onClick={() => handlePredictSelected()}>Predict Selected</button>
        </div>
    )
}

export default UploadedFileStrings;