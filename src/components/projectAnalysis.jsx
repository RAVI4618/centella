import React from 'react'

function ProjectAnalysis() {
    return (
        <>
            <div class="relative pt-1 mx-5">
                <div className="text-sm">Projects Analysis</div>
                <div className="text-4xl py-3">67 Projects</div>
                <div class="overflow-hidden h-5 mb-5 gap-1 text-xs flex rounded-xl bg-white border-gray-300">
                    <div style={{ width: "30%" }} className="shadow-none  flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#9CBEC9]"></div>
                    <div style={{ width: "35%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#A6C697]"></div>
                    <div style={{ width: "45%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#A09CBC]"></div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className=" border p-3 justify-center">
                        <div className="text-sm">Reactants</div>
                        <div className="text-2xl font-medium">1,1 K</div>
                    </div>
                    <div className=" border p-3 justify-center">
                        <div className="text-sm">Products</div>
                        <div className="text-2xl font-medium">1,5 K</div>
                    </div>
                    <div className=" border p-3 justify-center">
                        <div className="text-sm">No of Routes</div>
                        <div className="text-2xl font-medium">2,3 K</div>
                    </div>

                </div>

            </div>
        </>
    )
}

export default ProjectAnalysis