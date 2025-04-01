import loadanimation from '../images/molecule-unscreen.gif';

function Loader() {
  return (
    <div 
    className="inline-block  rounded-full  border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
    role="status">
      <img src={loadanimation} className="h-32 w-32 opacity-75" alt="Loading animation" />
    <span
      className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
    >Loading...</span>
  </div>
  )
}

export default Loader