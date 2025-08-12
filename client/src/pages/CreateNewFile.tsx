import { Add } from "iconsax-reactjs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { useRef, useState } from "react";
import { io } from "socket.io-client";

export default function CreateNewFile() {
    const [fileName, setFileName] = useState("")
    const [fileContent, setFileContent] = useState("")
    const socketRef = useRef(
        // io(`${import.meta.env.BACKEND_URL}`, { withCredentials: true })
        io(`http://localhost:3000`, { withCredentials: true })
    );

    const newFile = async () => {
        console.log({
            file: fileContent,
            fileName: fileName
        })
        socketRef.current.emit("updateFile", {
            file: fileContent,
            fileName: fileName
        })
    }


    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col gap-4 w-full max-w-md p-6 border rounded-md shadow-md bg-white">
                <h2 className="text-xl font-semibold text-gray-800">Create New File</h2>

                <div className="flex flex-col gap-1">
                    <label htmlFor="filename" className="text-sm text-gray-600">
                        File Name
                    </label>
                    <Input id="filename" placeholder="Enter file name..." onChange={(e) => setFileName(e.target.value)} />
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="filecontent" className="text-sm text-gray-600">
                        File Content
                    </label>
                    <Textarea
                        id="filecontent"
                        placeholder="Type your file content here..."
                        rows={10}
                        onChange={(e) => setFileContent(e.target.value)}
                    />
                </div>

                <Button className="flex items-center gap-2 self-end" onClick={newFile}>
                    <Add size="20" />
                    Create File
                </Button>
            </div>
        </div>
    );
}
