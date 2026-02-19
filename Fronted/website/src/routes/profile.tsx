import { useRef } from "react";
import Navbar from "../Components/Navbar";
import { useSelector } from "react-redux";

interface ProfileCardProps {
    data: string;
    title: string;
}


export default function Profile() {
    const firstName = useSelector((state: any) => state.user.firstName);
    const lastName = useSelector((state: any) => state.user.lastName);
    const email = useSelector((state: any) => state.user.email);
    const createdAt = useSelector((state: any) => state.user.createdAt);

    return (
        <div className="bg-gray-900 min-h-screen w-full flex flex-col items-center">
            <Navbar isDashboard={false} />
            {/*HeadLine*/}
            <div className="flex flex-col items-center justify-center">
                <h1 className="text-5xl font-extrabold text-white text-center mt-6 md:text-6xl">
                    Profile
                </h1>
            </div>

            <div>
                <ProfileCard data={firstName} title="First Name" />
                <ProfileCard data={lastName} title="Last Name" />
                <ProfileCard data={email} title="Email" />
                <ProfileCard data={fixDate(createdAt)} title="Created At" />

            </div>


        </div>
    );
}



function ProfileCard({ data, title }: ProfileCardProps) {

    return (
        <div className=" flex justify-between items-center mt-5 w-200 border-1 border-gray-700 rounded-2xl shadow-sm p-6 mt-8">
            <h2 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{title}</h2>
            <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">{data}</p>
        </div>
    )
}


function fixDate(createdAt: any) {
    const date = new Date(createdAt);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

