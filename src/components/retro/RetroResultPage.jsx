import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RetroBreakDown from '../../components/retro/RetroBreakDown';
import { IoCloudDownloadSharp } from 'react-icons/io5';
import Loader from '../../components/Loader';
 
function RetroResultPage({ predictionResult, onClose, smileString }) {
    const navigate = useNavigate();
    const [respData, setRespData] = React.useState([]);
    const [selectedRoute, setSelectedRoute] = React.useState(null);
    const [selectedRank, setSelectedRank] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);
 
    useEffect(() => {
        console.log("Prediction Result in RetroResultPage:", predictionResult);
        
        if (!predictionResult) {
            setIsLoading(false);
            return;
        }

        if (Array.isArray(predictionResult)) {
            setRespData(predictionResult);
            setSelectedRoute(predictionResult[0]);
        } else if (predictionResult?.result?.routes) {
            const routes = predictionResult.result.routes;
            setRespData(routes);
            setSelectedRoute(routes[0]);
        }
        
        setIsLoading(false);
    }, [predictionResult]);
 
    const handleRouteChange = (event) => {
        const selectedIndex = parseInt(event.target.value, 10);
        setSelectedRoute(respData[selectedIndex]);
        setSelectedRank(selectedIndex);
    };
 
    return (
        <>
            <div className='flex flex-col space-y-4'>
                <div className='space-y-2'>
                    <p className='font-bold mt-4'>Results</p>
                    
                    {respData.length > 0 && (
                        <div className='flex items-center space-x-2'>
                            {/* <span className='text-sm font-medium'>Confidence Score:</span> */}
                            <select
                                className='w-auto p-2 bg-[#E8E8E8] rounded-md text-dark hover:bg-[#D8D8D8] focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                onChange={handleRouteChange}
                                value={selectedRank}
                            >
                                {respData.map((route, index) => (
                                    <option 
                                        className='bg-white text-dark' 
                                        key={index} 
                                        value={index}
                                    >
                                        {`${index + 1}. Confidence: ${route.score ? route.score.toPrecision(3) : 'N/A'}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
                
                <div className='h-[70vh]'>
                    <div className='rounded w-full h-full p-2'>
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <Loader />
                            </div>
                        ) : selectedRoute ? (
                            <div className='w-full h-full'>
                                <RetroBreakDown 
                                    route={selectedRoute} 
                                    predictionResult={predictionResult} 
                                    smileString={smileString} 
                                />
                            </div>
                        ) : (
                            <div className="flex justify-center items-center h-full">
                                <p>No results available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
 
export default RetroResultPage;





 
 
 
     