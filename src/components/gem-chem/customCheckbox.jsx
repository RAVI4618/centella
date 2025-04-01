
const Custom_Checkbox = (props) => {

    return (
        <>
            <label class="relative flex items-center mr-2 rounded-full cursor-pointer" htmlFor="amber">
                <input type="checkbox" name={props.name}
                    class="before:content[''] peer relative h-4 w-4 cursor-pointer appearance-none border border-gray-500  checked:border-green-600 checked:bg-green-600 checked:before:bg-green-600 checked:border-green-600 hover:before:opacity-10"
                    id="amber" checked={props.checked} onClick={props.handleChange} />
                <span
                    class="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"
                        stroke="currentColor" stroke-width="1">
                        <path fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd"></path>
                    </svg>
                </span>
            </label>
        </>
    )
}

export default Custom_Checkbox;