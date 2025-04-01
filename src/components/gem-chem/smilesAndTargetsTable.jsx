import Custom_Checkbox from './customCheckbox';
import { IoEyeOutline } from "react-icons/io5";
import { AiOutlineDownload } from "react-icons/ai";
import { IoSearchOutline } from "react-icons/io5";
import { LiaTableSolid } from "react-icons/lia";
import { MdFormatListBulleted } from "react-icons/md";
import { LuRefreshCw } from "react-icons/lu";


const SmilesAndTargetsTable = () => {

    function showTooltip(){
        const tooltip = document.getElementById("msg-tooltip");
        tooltip.style.visibility= 'visible';
    }

    function hideTooltip(){
        const tooltip = document.getElementById("msg-tooltip");
        tooltip.style.visibility= 'hidden';
    }

    return (
        <>
            <div className='flex ml-10 mr-12 w-full'>
                <div className='w-[65%]'>
                    <input
                        type='text'
                        placeholder='File Name'
                        className=' pl-5 text-sm py-4 w-full'
                    />
                </div>
                <div className='w-[13%] '>
                    <button className='w-full rounded-r-lg items-center px-5 py-[1px] bg-[#CBD5DF] rounded-sm hover:dark:bg-slate-200 focus:outline-none'>
                        <p className='text-normal font-medium text-gray-900 mr-2 grid-rows-1 p-0 mt-1 relative top-1'>Upload File <br />
                            <span className='text-xs font-medium text-gray-700 mr-2 relative bottom-1'>.SML/SDF/MOL/.CSV</span>
                        </p>
                    </button>
                </div>
                <div className='w-[16%] mr-10 flex justify-center '>

                    <div id="msg-tooltip" className="top-[35px] text-center invisible     absolute z-10 inline-block px-3 py-2 text-sm font-medium transition-opacity duration-300 bg-sky-900 rounded-lg shadow-sm tooltip dark:bg-sky-400">
                        Smiles are validated<br /> successfully
                    </div>

                    <button onMouseOver={()=> showTooltip()} onMouseOut={()=> hideTooltip()}className='flex rounded-md w-full justify-center items-center px-6 py-[14px] ml-3 bg-gray-700 text-white rounded-sm hover:dark:bg-slate-600 focus:outline-none'>
                        <span className=' font-medium '>Validate Smile</span>
                    </button>
                </div>
            </div >
            <div className='mt-12 mr-12'>

                <div className=' ml-10 flex sm:flex-row flex-col mt-2 '>
                    <div className='block w-full shadow overflow-hidden sm:rounded-lg border-b border-gray-200'>
                        <table className='w-full border'>
                            <thead className='bg-[#F2F5FA] text-black-1000'>
                                <tr>
                                    <th className='text-left py-3 px-6 font-medium tracking-wider'>
                                        <span class='relative text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100'>
                                            <svg
                                                xmlns='http://www.w3.org/2000/svg'
                                                class='h-3.5 w-3.5'
                                                viewBox='0 0 20 20'
                                                fill='currentColor'
                                                stroke='currentColor'
                                                stroke-width='1'
                                            >
                                                <path
                                                    fill-rule='evenodd'
                                                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                                    clip-rule='evenodd'
                                                ></path>
                                            </svg>
                                        </span>
                                        <div className='flex mr-3'>
                                            <Custom_Checkbox checked={false} />
                                            <span className=''>Protein Name</span>
                                        </div>
                                        {/* Protein Name */}
                                    </th>
                                    <th className='text-left py-3 px-6 font-medium tracking-wider'>
                                        Organism
                                    </th>
                                    <th className='text-left py-3 px-6 font-medium tracking-wider'>
                                        ChEMBL ID
                                    </th>
                                    <th className='text-left py-3 px-6 font-medium tracking-wider'>
                                        Actives
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(7)].map((_, index) => (
                                    <tr
                                        key={index}
                                        className={` ${index % 2 === 0 ? 'bg-white' : 'bg-[#F2F5FA]'} items-center justify-center`}
                                    >
                                        <td className='py-4 px-6'>
                                            <label className='flex items-center'>
                                                <div className='flex mr-3'>
                                                    <Custom_Checkbox checked={false} />
                                                    <span className=''>Sample Name</span>
                                                </div>
                                            </label>
                                        </td>
                                        <td className='py-4 px-6'>Sample Name</td>
                                        <td className='py-4 px-6'>123456</td>
                                        <td className='py-4 px-6'>100</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </>

    )
}

export default SmilesAndTargetsTable;