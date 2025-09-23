import { authGet, authPost } from "../utils/http_utils";
import { io } from "socket.io-client";
import { getQuery } from "../utils/utils";

const chatIO = io("ws://localhost:3000/chat", {
    auth: {
        token: localStorage.getItem("jwt")
    }
});


chatIO.on("connect", function () {
    chatIO.on("msg", function (msg) {
        if (window.location.pathname == "/chat") {
            if (currentChatId() == msg.sender_id)
                appendMessage(msg, true, null);
            updateConversations()
        }
        else {
            Toastify({
                text: message(msg),
                gravity: "bottom",
                position: "right",
                avatar: `/data/user/getAvatarById?Id=${msg.sender.id}`,
                style: {
                    background: "#20262E"
                }
            }).showToast();
        }
    });
});


export async function Chat() {
    document.getElementById("main-views")!.innerHTML = ChatView;

    updateConversations();
    initUsers();
    updateChat();
}


const updateConversations = async () => {
    const conversaionsDiv = document.getElementById("conversations");

    if (!conversaionsDiv)
        return;

    try {
        const conversations = await authGet(`/api/conversations`);

        conversaionsDiv.innerHTML = "";

        for (let conversation of conversations) {
            const user = conversation.sender_is_me ? conversation.receiver : conversation.sender
            const newElement = document.createElement("a");
            newElement.classList.add('flex', 'list-item');
            newElement.onclick = function () {
                history.pushState(null, '', `/chat?id=${user.id}`);
                updateChat();
            };
            newElement.innerHTML = `
                <img class="avatar" src="/data/user/getAvatarById?Id=${user.id}">
                <div class="list-item-content flex-full flex-1 overflow-hidden">
                    <h4>${user.username || "-"}</h4>
                    <span>${message(conversation)}</span>
                </div>
            `;
            conversaionsDiv?.appendChild(newElement)
        }
    } catch (e) {
        console.error(e)
    }
}

const message = (conversation) => {
    return conversation.type === "INVITE" ? "Invitation!" : conversation.message;
}

const initUsers = async () => {
    const usersDiv = document.getElementById("users");

    try {
        const users = await authGet("/api/users");
        for (let user of users) {
            const newElement = document.createElement("a");
            newElement.classList.add('flex', 'list-item');
            newElement.onclick = function () {
                const shouldUpdate = currentChatId() != user.id
                history.pushState(null, '', `/chat?id=${user.id}`);
                if (shouldUpdate)
                    updateChat();
            };
            newElement.innerHTML = `
                <img class="avatar" src="/data/user/getAvatarById?Id=${user.id}" alt="">
                <div class="list-item-content">
                    <h4>${user.username || "-"}</h4>
                </div>
            `;
            usersDiv?.appendChild(newElement)
        }
    } catch (e) {
        console.error(e)
    }
}


const currentChatId = () => {
    return getQuery("id");
}


const updateChat = async () => {
    const element = document.getElementById("conversation");
    if (!element)
        return
    const id = currentChatId();

    if (!id)
        return (element.innerHTML = "<h5 class=\"text-center\">Start a conversation.</h5>")

    const user = await authGet(`/api/users/${id}`);

    element.innerHTML = `
    <div class="header">
    <h2>${user.username ?? "-"}</h2>
    </div>
    
    <div id="chat" class="conversation scroll-box pv-5">
    </div>

    <div class="mh-5">
    <div class="flex center">
        <img class="avatar small mr-5" src="/data/user/getAvatarById?Id=${user.id}" alt="">
        <form id="form" class="input flex flex-1">
            <input id="input" class="pl-3" type="text" placeholder="Type a message..." />
            <button>Send</button>
        </form>
    </div>
    
    <div class="mt-5 inline-block gap-medium">
        <button class="btn-secondary" id="invite">
            <div class="flex center gap-small">
                <svg width="18px" height="18px" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                </svg>
    
                Invite to Pong
            </div>
        </button>
    
       <a href="/profile?id=${user.id}">
        <button class="btn-secondary">
            <div class="flex center gap-small">
                <svg width="18px" height="18px" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>

                View Profile
            </div>
        </button>
       </a>
    
    
        <button class="btn-secondary danger">
            <div class="flex center gap-small">
                <svg width="18px" height="18px" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                </svg>
    
                Block User
            </div>
        </button>
    </div>
    </div>
    `;
    document.getElementById("invite")!.onclick = async function (event) {
        await sendMessage(event, id, "INVITE");
    }

    const form = document.getElementById("form");
    form!.onsubmit = async function (event) {
        await sendMessage(event, id, "MSG");
    };
    await updateMessages(id);
}


const updateMessages = async (other) => {
    const conversationDiv = document.getElementById("chat");
    if (!conversationDiv)
        return;

    const messages = await authGet(`/api/messages/${other}`);

    for (let msg of messages)
        appendMessage(msg, false, conversationDiv)
}

const appendMessage = (msg, prepend: boolean, conversationDiv) => {
    conversationDiv = conversationDiv ?? document.getElementById("chat");
    if (!conversationDiv)
        return;
    const newElement = document.createElement("div");
    newElement.classList.add(msg.sender_is_me ? 'msg-me' : 'msg', 'flex', 'bottom', 'gap-medium');
    if (msg.type === "INVITE") {
        if (msg.sender_is_me) {
            newElement.innerHTML = `
            <div class="box">
                <p>You sent a pong game invitation.</p>
            </div>
        `;
        } else {
            newElement.innerHTML = `
        <img class="avatar small" src="/data/user/getAvatarById?Id=${msg.sender.id}" alt="">
    
        <div class="box">
            <p>${msg.sender.username} invited you to play pong</p>
    
            <button class="btn-secondary success" id="invite">
            <div class="flex center gap-small center-v">
                <svg width="18px" height="18px" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                </svg>
    
                Accept
            </div>
        </button>
        </div>
    `;
        }
    } else {
        newElement.innerHTML = msg.sender_is_me ? `
        <div class="box">
            <p class="m-0">${msg.message}</p>
        </div>
    `: `
        <img class="avatar small" src="/data/user/getAvatarById?Id=${msg.sender.id}" alt="">

        <div class="box">
            <p class="m-0">${msg.message}</p>
        </div>
    `;
    }



    if (prepend) {
        conversationDiv?.prepend(newElement)
        conversationDiv?.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    else
        conversationDiv?.appendChild(newElement)
}


const sendMessage = async (event, userId, type) => {
    event.preventDefault();
    let message;
    if (type === "MSG") {
        message = getMessage();
        if (!message || message === "")
            return;
    }
    else if (type === "INVITE")
        message = null;
    else
        return;
    const msg = await authPost(`/api/conversations/${userId}`, { message: message, type: type });
    appendMessage(msg, true, null);
    updateConversations();
}

const getMessage = () => {
    const input = document.getElementById("input") as HTMLInputElement;
    const message = input.value;
    input.value = "";
    return message;
}


const ChatView: string = `
<section class="chat flex">
<div class="left section scroll-box">
    <div class="input flex mh-5">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input type="text" placeholder="Search" />
    </div>

    <div class="mv-5">
        <h3 class="mh-5 mb-3">Conversations</h3>

        <div id="conversations" class="list">
        </div>

        <h3 class="mh-5 mt-5 mb-3">All users</h3>

        <div id="users" class="list">
        
        </div>
    </div>

</div>

<div class="right section">
    <div id="conversation" class="h-full flex-column center-v">
        
    </div>
</div>
</section>
`;