import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SmilesAndTargetsTable = () => {
    const location = useLocation();
    const { selectedFileData } = location.state || {};
    console.log("File data received in SmilesAndTargetsTable component:", selectedFileData);

    const navigate = useNavigate();

    const handleNext = () => {
        navigate('/projects/genchem/select-molecule', { state: { selectedFileData } });
    };

    return (
        <div className="bg-[#F5F9F8] ml-5">
            <div className='flex justify-between my-10 mx-5 '>
                <div className='flex w-full '>
                    <div className="w-[10%] ">
                        <div className="px-2 text-gray-900 font-medium">ChEMBL ID</div>
                        <div className="px-2 text-gray-900">74235463</div>
                    </div>
                    <div className="inline-block top-[12px] relative h-[25px] min-h-[1em] w-0.5 self-stretch bg-neutral-500 bg-gray-400"></div>
                    <div className="w-[16%] ml-10">
                        <div className="px-2 text-gray-700 font-medium">Orgnism</div>
                        <div className="px-2 text-gray-700">BN325346546SG</div>
                    </div>
                    <div className="inline-block top-[12px] relative h-[25px] min-h-[1em] w-0.5 self-stretch bg-neutral-500 bg-gray-400"></div>
                    <div className="w-[12%] ml-10">
                        <div className="px-2 text-gray-700 font-medium">Protien Name</div>
                        <div className="px-2 text-gray-700">BN325346546SG</div>
                    </div>
                </div>
            </div>
            <div className='mt-12 mr-12 mx-5'>
                <div className='flex sm:flex-row flex-col mt-2'>
                    <div className='block w-full shadow overflow-hidden sm:rounded-lg border-b border-gray-200'>
                        <table className='w-full border'>
                            <thead className='bg-[#F2F5FA] text-black-1000'>
                                <tr>
                                    <th className='text-left py-3 px-6 font-medium tracking-wider'>
                                        <span className='relative text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100'>
                                            <svg
                                                xmlns='http://www.w3.org/2000/svg'
                                                className='h-3.5 w-3.5'
                                                viewBox='0 0 20 20'
                                                fill='currentColor'
                                                stroke='currentColor'
                                                strokeWidth='1'
                                            >
                                                <path
                                                    fillRule='evenodd'
                                                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                                    clipRule='evenodd'
                                                ></path>
                                            </svg>
                                        </span>
                                        <div className='flex mr-3'>
                                            <span>Smiles</span>
                                        </div>
                                    </th>
                                    <th className='text-left py-3 px-6 font-medium tracking-wider'>
                                        Compound ID
                                    </th>
                                    <th className='text-left py-3 px-6 font-medium tracking-wider'>
                                        Structure
                                    </th>
                                    <th className='text-left py-3 px-6 font-medium tracking-wider'>
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(7)].map((_, index) => (
                                    <tr
                                        key={index}
                                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F2F5FA]'} items-center justify-center`}
                                    >
                                        <td className='py-4 px-6'>
                                            <label className='flex items-center'>
                                                <div className='flex mr-3'>
                                                    <span>Sample Name</span>
                                                </div>
                                            </label>
                                        </td>
                                        <td className='py-4 px-6'>BN324523523GS</td>
                                        <td className='py-4 px-6'>View</td>
                                        <td className='py-4 px-6'>Valid</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className='py-2 align-middle inline-block min-w-full my-10 mb-6 flex justify-end'>
                    <button
                        className='relative text-white items-center px-8 py-2 border border-gray-300 text-sm font-medium rounded-md bg-gray-700 w-[130px]'
                        onClick={handleNext}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SmilesAndTargetsTable;
