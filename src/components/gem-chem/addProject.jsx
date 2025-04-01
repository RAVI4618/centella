import {
    TERipple,
    TEModal,
    TEModalDialog,
    TEModalContent,
    TEModalHeader,
    TEModalBody,
    TEModalFooter,
} from "tw-elements-react";
import React, { useState, useEffect } from "react";

const AddGenChemProject = (props) => {
    const { addProjectStatus, setAddProjectStatus } = props;
    // const initialAddProjectPage = 1;
    const [isChecked, setIsChecked] = useState(true);


    useEffect(() => {
        console.log("isChecked: ", isChecked)
    }, [isChecked])

    return (
        <TEModal show={addProjectStatus} setShow={setAddProjectStatus} staticBackdrop>
            <TEModalDialog size="sm">
                <TEModalContent>
                    <TEModalHeader className='dark:text-white bg-[#203D49] '>
                        {/* <!--Modal title--> */}
                        <h5 className="text-xl font-medium leading-normal ">
                            New Project
                        </h5>
                        {/* <!--Close button--> */}
                        <button
                            type="button"
                            className="box-content rounded-none border-none hover:no-underline hover:opacity-75 focus:opacity-100 focus:shadow-none focus:outline-none"
                            onClick={() => setAddProjectStatus(false)}
                            aria-label="Close"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="h-6 w-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </TEModalHeader>
                    {/* <!--Modal body--> */}
                    <TEModalBody>

                        <div className='px-4 mt-6'>
                            <div className="text-center">
                                <label for="Toggle3" className="w-full inline-flex items-center px-2 cursor-pointer dark:text-gray-100 dark:bg-[#F3F4F6] rounded-3xl font-semibold">
                                    <input id="Toggle3" type="checkbox" className="hidden peer" value={isChecked} onChange={(e) => { setIsChecked(e.target.checked); }} />
                                    <span className={`${isChecked ? "py-2" : "py-1"} w-1/2 px-4 rounded-3xl dark:text-[#F3F4F6] dark:bg-[#4A5567] peer-checked:dark:bg-[#F3F4F6] peer-checked:dark:text-gray-600`}>SBDD</span>
                                    <span className="w-1/2 peer-checked:dark:py-1 px-4 py-2 rounded-3xl dark:text-gray-700 dark:bg-[#F3F4F6] peer-checked:dark:bg-[#4A5567] peer-checked:dark:text-[#F3F4F6]">LBDD</span>
                                </label>
                            </div>

                            <form>
                                <div className="grid gap-6 mb-32 my-10 md:grid-cols-1 font-normal text-xs">
                                    <>
                                        <div>
                                            <label for="last_name" className="block mb-2 text-gray-900 dark:text-black">Project Name</label>
                                            <input type="text" id="first_name" className="text-gray-900 text-sm rounded-xl block w-full p-2.5 dark:bg-[#F3F4F6] dark:border-gray-600 dark:placeholder-gray-400" placeholder="" required />
                                        </div>
                                        <div>
                                            <label for="company" className="block mb-2 text-gray-900 dark:text-black">Project Description</label>
                                            <input type="text" id="first_name" className="text-gray-900 text-sm rounded-xl block w-full p-2.5 dark:bg-[#F3F4F6] dark:border-gray-600 dark:placeholder-gray-400" placeholder="" required />
                                        </div>
                                        <div>
                                            <label for="phone" className="block mb-2 text-gray-900 dark:text-black">Add Collaborators</label>
                                            <input type="text" id="first_name" className="text-gray-900 text-sm rounded-xl block w-full p-2.5 dark:bg-[#F3F4F6] dark:border-gray-600 dark:placeholder-gray-400" placeholder="Search/Select Collaborators" required />
                                        </div>
                                    </>
                                </div>
                            </form>
                        </div>
                    </TEModalBody>
                    <TEModalFooter>
                        <TERipple rippleColor="light">
                            <button
                                type="button"
                                className="inline-block !text-gray-500 rounded border px-8 pb-2 pt-2.5 text-xs font-medium leading-normal text-primary-700 transition duration-150 ease-in-out hover:bg-primary-accent-100 focus:bg-primary-accent-100 focus:outline-none focus:ring-0 active:bg-primary-accent-100"
                                onClick={() => setAddProjectStatus(false)}
                            >
                                Cancel
                            </button>
                        </TERipple>
                        <TERipple rippleColor="light">
                            <button
                                type="button"
                                className="ml-1 inline-block rounded !bg-[#4E8FAB] px-8 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-[#4E8FAB]-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                            // onClick={() => setFormAt(formAt + 1)}
                            >
                                Add
                            </button>
                        </TERipple>
                    </TEModalFooter>
                </TEModalContent>
            </TEModalDialog>
        </TEModal>
    )
}

export default AddGenChemProject;