import React,{useState} from 'react';
import { FaRegUser, FaChevronDown } from 'react-icons/fa';
import { FiEdit } from "react-icons/fi";

const UserProfileDetails = () =>{

    const [profile, setProfile] = useState({
        email: '',
        mobileNumber: '',
        dob: '',
        password: '',
        aboutYou: '',
        bloodGroup: '',
        alternativeNumber: '',
        location: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log(profile);
    };

    const handleProfileEdit=()=>{

    }

    return(
        <>
   <div className="p-6">
  <div
    className="p-4 bg-[#606060] text-white rounded-md"
    style={{ top: '137px', width: '258px', height: '577px' }}
  >
    {/* <button
      className="top-4 flex right-4 ml-48 text-[#FFFFFF]"
      style={{ fontSize: '16px', lineHeight: '21px' }}
      onClick={handleProfileEdit}
    >
      <FiEdit /> Edit
    </button> */}
    <div className="flex flex-col items-center mt-4">
      <div className="w-24 h-24 bg-[#FFFFFF] rounded-full mb-4"></div>
      <h2
        className="text-lg font-semibold"
        style={{
          textAlign: 'left',
          fontWeight: '600',
          fontSize: '16px',
          lineHeight: '21px',
          fontFamily: 'Segoe UI',
          letterSpacing: '0px',
          color: '#FFFFFF',
        }}
      >
        Dr. Riyaz Ahmed
      </h2>
      <h3
        className="text-sm"
        style={{
          textAlign: 'left',
          fontSize: '16px',
          lineHeight: '21px',
          fontFamily: 'Segoe UI',
          letterSpacing: '0px',
          color: '#FFFFFF',
        }}
      >
        Founder & CEO
      </h3>
    </div>
    <form className="flex flex-col mt-8 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm opacity-75  mb-1">Name</label>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={profile.name}
          onChange={handleChange}
          className="bg-[#E7DDFF] text-black p-2 rounded-md opacity-75 w-full"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm opacity-75  mb-1">Email</label>
        <input
          type="text"
          name="email"
          placeholder="Email"
          value={profile.email}
          onChange={handleChange}
          className="bg-[#E7DDFF] text-black p-2 rounded-md w-full"
        />
      </div>
      <div>
        <label htmlFor="mobileNumber" className="block text-sm  opacity-75 mb-1">Mobile Number</label>
        <input
          type="text"
          name="mobileNumber"
          placeholder="Mobile Number"
          value={profile.mobileNumber}
          onChange={handleChange}
          className="bg-[#E7DDFF] text-black p-2 rounded-md w-full"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm opacity-75  mb-1">Last Changed Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter last changed password"
          value={profile.password}
          onChange={handleChange}
          className="bg-[#E7DDFF] text-black p-2 rounded-md w-full"
        />
      </div>
    </form>
  </div>

  
  <div
    className="absolute p-4  rounded-md "
    style={{ top: '34px', left: '350px' }}
  >
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="aboutYou">
          About you
        </label>
        <textarea
          name="aboutYou"
          value={profile.aboutYou}
          onChange={handleChange}
          className="w-full p-2 rounded-md"
          rows="5"
        ></textarea>
      </div>
      <div className="grid grid-cols-3 gap-4 w-full">
        {/* <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bloodGroup">
            Blood Group
          </label>
          <input
            type="text"
            name="bloodGroup"
            value={profile.bloodGroup}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            style={{ height: '34px', background: '#FFFFFF', borderRadius: '7px', opacity: 1 }}
          />
        </div> */}
        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="alternativeNumber">
            Alternative Number
          </label>
          <input
            type="text"
            name="alternativeNumber"
            value={profile.alternativeNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            style={{ height: '34px', background: '#FFFFFF', borderRadius: '7px', opacity: 1 }}
          />
        </div>
        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={profile.location}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            style={{ height: '34px', background: '#FFFFFF', borderRadius: '7px', opacity: 1 }}
          />
        </div>
      </div>
      <div className="flex justify-end mt-12">
        <button type="submit"  className=" text-white px-12 py-2 bg-[#4A5568] rounded-md">
          Update
        </button>
      </div>
    </form>
  </div>
</div>
        </>
    )
}

export default UserProfileDetails;