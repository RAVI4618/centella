import React, { useState } from 'react';
import SmilesTable from '../../components/gem-chem/smilesTable';
import TargetsTable from '../../components/gem-chem/targetsTable';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import DNA from '../../images/samplepic1.png'
import smiles from '../../images/samplepic2.png'
import Target from '../../images/samplepic3.png'


const GenChemSmilesAndTargets = () => {
    const initialSelection = { smiles: false, targets: false, both: false };
    const [selection, setSelection] = useState(initialSelection);
    
   
    const navigate = useNavigate();
    const location = useLocation();
    const handleSelection = (name) => {
        const path = location.pathname.split('/');
        const projectId = path[path.length - 2];
   
        if (name === 'smiles') {
            navigate(`/projects/generativeai/smiles/${projectId}`);
        } else if (name === 'targets') {
            navigate(`/projects/generativeai/targets/${projectId}`);
        } else if (name === 'smile&targets') {
            navigate(`/projects/generativeai/smile&targets/${projectId}`);
        }
    };
    


 

    return (
        
        <div className='container mx-auto px-4 sm:px-8 mt-12'>
                <div>
                    <p className="mt-6 ml-4 flex flex-row"><Link className='  font-semibold text-[#3182CE]' to={`/`}>Home</Link> <img src="https://cdn-icons-png.flaticon.com/128/8591/8591654.png" height={20} width={20} alt="" className="mt-1" />
                        <Link className='  font-semibold text-[#3182CE]' to={`/${location.pathname.split('/')[1]}`}>  Projects</Link> <img src="https://cdn-icons-png.flaticon.com/128/8591/8591654.png" height={20} width={20} alt="" className="mt-1" /> <Link className='  font-semibold text-[#3182CE]' to={location.pathname.substring(0, location.pathname.lastIndexOf('/'))}>  ProjectDetails</Link> </p>
                </div>
        <div className='py-8'>
            <div className='grid grid-cols-1 mx-12 my-12 md:grid-cols-3 gap-10'>
                <div
                    className={`relative p-4 bg-white shadow-lg rounded-[25px] text-center h-64 w-full cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-105 ${selection.smiles && !selection.targets ? 'ring-2 ring-green-500' : ''}`}
                    onClick={() => handleSelection('smiles')}
                >
                    <button className='absolute top-4 left-4 bg-[#d6e6fe] text-sm font-bold text-[#735DA8] py-2 px-4 rounded-[15px]'>
                        SMILES
                    </button>
                    <img src={smiles} alt="SMILES" className="w-full h-48 object-cover mt-6 ml-8" />
                </div>
                <div
                    className={`relative p-4 bg-white shadow-lg rounded-[25px] text-center h-64 cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-105 ${selection.targets && !selection.smiles ? 'ring-2 ring-green-500' : ''}`}
                    onClick={() => handleSelection('targets')}
                >
                    <button className='absolute top-4 left-4 bg-[#d6e6fe] text-sm font-bold text-[#735DA8] py-2 px-4 rounded-[15px]'>
                        Targets
                    </button>
                    <img src={DNA} alt="Targets" className="w-52 h-52 ml-16 mt-6" />
                </div>
                <div
                    className={`relative p-4 bg-white shadow-lg rounded-[25px] text-center h-64 cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-105 ${selection.smiles && selection.targets ? 'ring-2 ring-green-500' : ''}`}
                    onClick={() => handleSelection('smile&targets')}
                >
                    <button className='absolute top-4 left-4 bg-[#d6e6fe] text-sm font-bold text-[#735DA8] py-2 px-4 rounded-[15px]' 
                  
                     > 
                        SMILES & Targets
                    </button>
                    <img src={Target} alt="SMILES & Targets" className="w-52 h-52 mt-6 ml-16" />
                </div>
            </div>
        </div>
    </div>
    
    );
};

export default GenChemSmilesAndTargets;
