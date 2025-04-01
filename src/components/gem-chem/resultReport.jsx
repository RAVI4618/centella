import {
    TERipple,
    TEModal,
    TEModalDialog,
    TEModalContent,
    TEModalHeader,
    TEModalBody,
} from "tw-elements-react";
import React, { useState, useEffect } from "react";
import SmileViewer from "../../components/smileViewer";

const AddGenChemProject = (props) => {
    const { isOpened, updateStatus, smileString } = props;

    return (
        <TEModal show={isOpened} setShow={updateStatus} staticBackdrop>
            <TEModalDialog size="xl">
                <TEModalContent>
                    <TEModalHeader className='dark:text-white bg-[#3182CE] font-bold'>
                        {/* <!--Modal title--> */}
                        <h3 className="font-medium leading-normal">
                            Report
                        </h3>
                        {/* <!--Close button--> */}
                        <button
                            type="button"
                            className="box-content rounded-none border-none hover:no-underline hover:opacity-75 focus:opacity-100 focus:shadow-none focus:outline-none"
                            onClick={() => updateStatus(false)}
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
                        <div className='px-4 my-10 flex justify-around'>
                            <div className="text-center">
                                <div>
                                    <SmileViewer smileString={smileString} id="modal-smile" imgwidth={300} imgheight={350} />
                                </div>
                                <div className="py-3">
                                    {/* <text>AO-022/413565431</text> */}
                                </div>
                                {/* <div>
                                    <SmileViewer smileString={smileString} id="modal-smile-duplicate" imgwidth={150} imgheight={150} />
                                </div> */}
                            </div>
                            <div className="w-[27%]">
                                <div className="bg-[#F5F9F8] row h-fit border border-slate-400 flex justify-between">
                                    <div className="px-6 py-5 text-gray-900 font-medium">Mol Weight</div>
                                    <div className="px-6 py-5 text-gray-900">460.11</div>
                                </div>
                                <div className="row h-fit border-t-0 border border-slate-400 flex justify-between">
                                    <div className="px-6 py-5 text-gray-900 font-medium">H_Donor</div>
                                    <div className="px-6 py-5 text-gray-900">1</div>
                                </div>
                                <div className="bg-[#F5F9F8] border-t-0 row h-fit border border-slate-400 flex justify-between">
                                    <div className="px-6 py-5 text-gray-900 font-medium">A_LogP</div>
                                    <div className="px-6 py-5 text-gray-900">1.63</div>
                                </div>
                                <div className="row h-fit border-t-0 border border-slate-400 flex justify-between">
                                    <div className="px-6 py-5 text-gray-900 font-medium">Rotatable Bonds</div>
                                    <div className="px-6 py-5 text-gray-900">9</div>
                                </div>
                                <div className="bg-[#F5F9F8] border-t-0 row h-fit border border-slate-400 flex justify-between">
                                    <div className="px-6 py-5 text-gray-900 font-medium">H_Acceptor</div>
                                    <div className="px-6 py-5 text-gray-900">7</div>
                                </div>
                                <div className="row border-t-0 h-fit border border-slate-400 flex justify-between">
                                    <div className="px-6 py-5 text-gray-900 font-medium">TPSA</div>
                                    <div className="px-6 py-5 text-gray-900">460.11</div>
                                </div>
                            </div>
                        </div>
                    </TEModalBody>
                </TEModalContent>
            </TEModalDialog>
        </TEModal>
    );
};

export default AddGenChemProject;
