import React from 'react'
import { IoMdMore } from "react-icons/io";
import { MdOutlineFileDownload } from "react-icons/md";

export default function ReceiverChat({receiverDetails, message}) {
  return (
    <div className="flex items-start" key={message._id}>
    <img
        className="mr-2 h-8 w-8 rounded-full"
        src={receiverDetails.avatar}
    />
    <div className="flex rounded-b-xl rounded-tr-xl bg-slate-50 p-2 dark:bg-slate-800 sm:max-w-md md:max-w-2xl">
        {
            message.messageType == "text" &&
            <p className="flex break-words break-all">
                {message.message}
            </p>
        }
        {
            (['image', 'jpg', 'jpeg', 'png'].filter((f) => f === message.messageType)).length != 0 &&
            <img src={message.message} alt={message.messageType} className="h-56 w-56 rounded-lg" />
        }
        {
            message.messageType == "pdf" &&
            <p className="flex items-center">{message.fileName}.pdf
                <a href={message.message} download target="_blank">
                    <MdOutlineFileDownload className="text-2xl" />
                </a>
            </p>

        }
        {// for all type of document like excel, word, text etc
            message.messageType == "raw" &&
            <p className="flex items-center">{message.fileName}
                <a href={message.message} download target="_blank">
                    <MdOutlineFileDownload className="text-2xl" />
                </a>
            </p>

        }
        {
            (['video', 'mp4'].filter((f) => f === message.messageType)).length != 0 &&
            <video controls width="400" height="">
                <source src={message.message} type="video/mp4" />
            </video>
        }
        {
            (['text', 'jpg', 'jpeg', 'png', 'image', 'video', 'mp4', 'pdf', 'raw'].filter((f) => f === message.messageType)).length == 0 &&
            <p>This message format is not valid</p>
        }
    </div>
</div>
  )
}
