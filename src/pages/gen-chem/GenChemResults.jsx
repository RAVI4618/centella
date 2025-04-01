
import React, { useState, useEffect } from 'react';
import { IoEyeOutline } from "react-icons/io5";
import { AiOutlineDownload } from "react-icons/ai";
import { MdContentCopy } from "react-icons/md";
import { toast } from 'sonner';
import Loader from '../../components/Loader';
import ResultReport from "../../components/gem-chem/resultReport";
import SmileViewer from '../../components/smileViewer';
import Molscore from './Molscore';
import GenChemDistribution from './GenChemDistribution';
import MoleculeStructure from './3DMoleculeStructure';

const GenChemResults = () => {
    const staticTaskId = '79eaadba-10e7-4491-b4ce-c1b947324168';
    const [isListView, setIsListView] = useState(false);
    const [resultReportStatus, setResultReportStatus] = useState(false);
    const [selectedSmile, setSelectedSmile] = useState(null);
    const [smilesData, setSmilesData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [itemsToShow, setItemsToShow] = useState(16);
    const [loadingMore, setLoadingMore] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        if (staticTaskId) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`https://caitspringclusterapi-dev-genchem-ai-workflow-api.azuremicroservices.io/api/genchem/status?task_id=${staticTaskId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch SMILES data');
                    }
                    const data = await response.json();
                    if (data && data.content) {
                        const smilesArray = data.content.split('\r,');
                        setSmilesData(smilesArray);
                    } else {
                        throw new Error('Invalid data format');
                    }
                } catch (error) {
                    setError(error.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [staticTaskId]);

    const handleEyeClick = (smile) => {
        setSelectedSmile(smile);
        setResultReportStatus(true);
    };

    const handleCopyClick = (smile) => {
        navigator.clipboard.writeText(smile).then(() => {
            toast.success('SMILES string copied to clipboard!', {
                className: 'mt-4'
            });
        }).catch(err => {
            console.error('Failed to copy: ', err);
            toast.error('Failed to copy SMILES strings.', {
                className: 'mt-4'
            });
        });
    };

    const handleShowMore = () => {
        setLoadingMore(true);
        setTimeout(() => {
            setItemsToShow(prev => prev + 16);
            setLoadingMore(false);
        }, 1000);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return <div><Molscore/></div>;
            case 1:
                return <div><GenChemDistribution/></div>;
            case 2:
                return <div></div>;
            case 3:
                return <div><MoleculeStructure /></div>;
            default:
                return null;
        }
    };


    return (
        <div className='bg-[#F5F9F8] px-10 w-full py-20'>
                   {resultReportStatus && (
                        <ResultReport
                            isOpened={resultReportStatus}
                            updateStatus={setResultReportStatus}
                            smileString={selectedSmile}
                        />
                    )}
        
                    {/* Tabs Section */}
                    <div className="flex justify-center w-full  mb-10">
            <div className="border w-[100%] flex flex-row justify-around  border-gray-300 flex space-x-8 shadow-lg p-2 rounded-lg">
                {["Identification and Validation", "Chemical Space", "ADMET", "Molecular Alignment"].map((tab, index) => (
                    <button
                        key={index}
                        className={`py-2 px-4 border font-semibold rounded-lg shadow-md transition-all duration-300 ${
                            activeTab === index
                                ? "border-[#735AA7] border-2 bg-white text-indigo-600 shadow-lg"
                                : "bg-gray-100 text-gray-700 hover:text-dark hover:bg-white"
                        }`}
                        onClick={() => setActiveTab(index)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
        
        
                    {/* Tab Content */}
                    <div className="w-full">
                        {renderTabContent()}
                    </div>
        
                    {activeTab !== 1 && activeTab !== 3 && !loading && (
                <>
                    {error && <div>Error: {error}</div>}
   
                    {!isListView ? (
                        <div className='w-full'>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
                                {smilesData.slice(0, itemsToShow).map((smile, index) => (
                                    <div key={index} className='mt-24'>
                                        <div className='flex justify-around w-[85%] h-[78%] bg-white border mb-2 rounded shadow-4xl p-5'>
                                            <div>
                                                <SmileViewer smileString={smile} id={`smile-${index}`} imgwidth={150} imgheight={150} />
                                            </div>
                                            <div className='flex flex-row text-center mr-2 '>
                                                <span>
                                                    <IoEyeOutline size={"20px"} onClick={() => handleEyeClick(smile)} />
                                                </span>
                                                <span>
                                                    <AiOutlineDownload size={"25px"} />
                                                </span>
                                                <span className='cursor-pointer'>
                                                    <MdContentCopy size={"22px"} onClick={() => handleCopyClick(smile)} />
                                                </span>
                                            </div>
                                        </div>
                                        <div className='w-[85%] h-[32%] bg-white border-2 border-slate-200 rounded'>
                                            <div className="flex justify-between">
                                                <div className="w-[70%]">
                                                    <div className="px-2 py-2 text-gray-900 font-medium">Compound ID</div>
                                                    <div className="px-2 py-1 text-gray-900">BN242354636GS</div>
                                                </div>
                                                <div className="w-[30%]">
                                                    <div className="px-2 py-2 text-gray-700 font-medium">Score</div>
                                                    <div className="px-2 py-1 text-gray-700">12.42</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md m-5 w-full">
                            <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 font-medium text-gray-900">ID</th>
                                        <th className="px-6 py-4 font-medium text-gray-900">Smiles</th>
                                        <th className="px-6 py-4 font-medium text-gray-900">Score</th>
                                        <th className="px-6 py-4 font-medium text-gray-900">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 border-t border-gray-100">
                                    {smilesData.slice(0, itemsToShow).map((smile, index) => (
                                        <tr className="hover:bg-gray-50" key={index}>
                                            <td className="px-6 py-4">{index + 1}</td>
                                            <td className="px-6 py-4">{smile}</td>
                                            <td className="px-6 py-4">12.42</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-start gap-4">
                                                    <IoEyeOutline size={"20px"} onClick={() => handleEyeClick(smile)} />
                                                    <AiOutlineDownload size={"25px"} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
   
                    {itemsToShow < smilesData.length && (
                        <div className="w-full flex justify-center py-10">
                            <button className="bg-indigo-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700" onClick={handleShowMore}>
                                {loadingMore ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </>
            )} {loading && <Loader />}
 
                </div>
    );
};

export default GenChemResults;

