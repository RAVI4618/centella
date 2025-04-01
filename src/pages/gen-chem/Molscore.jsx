
import React, { useEffect, useState } from "react";
import { toast } from 'sonner';
import GenChemDistribution from "./GenChemDistribution";


const Molscore = () => {

    const [inputSmiFile, setInputSmiFile] = useState(null);
    const [genSmiFile, setGenSmiFile] = useState(null);
    const [validationData, setValidationData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const uploadFiles = async () => {
        if (!inputSmiFile || !genSmiFile) {
            toast.error("Please upload both files.");
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('input_smi', inputSmiFile);
            formData.append('gen_smi', genSmiFile);

            const response = await fetch('https://caitspringclusterapi-dev-genchem-ai-workflow-api.azuremicroservices.io/api/genchem/molscore-validation', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to validate molecules');
            }

            const data = await response.json();
            setValidationData(data); // Store the response data
            toast.success('Molecule validation successful!');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to render validation tables
    const renderValidationTables = () => {
        if (!validationData) return null;

        const { Validity, Uniqueness, Novelty, ...testValues } = validationData;

        return (
            <div className="mt-10">
                {/* First Table for Uniqueness, Validity, Novelty */}
                <h2 className="text-lg font-semibold mb-4">Validation Scores</h2>
                <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="border bg-[#735AA7] text-white px-4 py-2">Metric</th>
                            <th className="border bg-[#735AA7] text-white px-4 py-2">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border px-4 py-2">Validity</td>
                            <td className="border px-4 py-2">{Validity}</td>
                        </tr>
                        <tr>
                            <td className="border px-4 py-2">Uniqueness</td>
                            <td className="border px-4 py-2">{Uniqueness}</td>
                        </tr>
                        <tr>
                            <td className="border px-4 py-2">Novelty</td>
                            <td className="border px-4 py-2">{Novelty}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Second Table for Remaining Test Values */}
                <h2 className="text-lg font-semibold mt-8 mb-4">Test Values</h2>
                <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="border px-4 bg-[#735AA7] text-white py-2">Metric</th>
                            <th className="border px-4 bg-[#735AA7] text-white py-2">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(testValues).map(([key, value]) => (
                            <tr key={key}>
                                <td className="border px-4 py-2">{key}</td>
                                <td className="border px-4 py-2">{value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <>
            {/* Validation Table */}
            <div className="mt-8">
                <h1 className="text-xl font-semibold mb-4">MolScore Validation</h1>
                <div className="flex flex-col md:flex-row items-center">
                    <input
                        type="file"
                        onChange={(e) => setInputSmiFile(e.target.files[0])}
                        className="border p-2 mb-4 md:mb-0 md:mr-4"
                    />
                    <input
                        type="file"
                        onChange={(e) => setGenSmiFile(e.target.files[0])}
                        className="border p-2 mb-4 md:mb-0 md:mr-4"
                    />
                    <button
                        className="px-4 py-2 bg-[#3182CE] text-white rounded-md font-semibold transition-all duration-300 hover:bg-indigo-500"
                        onClick={uploadFiles}
                        disabled={loading}
                    >
                        {loading ? "Validating..." : "Upload and Validate"}
                    </button>
                </div>

                {renderValidationTables()}
            </div>
            {/* <GenChemDistribution/> */}
        </>
    )
}

export default Molscore;