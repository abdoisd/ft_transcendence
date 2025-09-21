import { route } from "../frontend";
import { authGet } from "../utils/http_utils";

export async function Chat() {
    document.getElementById("main-views")!.innerHTML = ChatView;

    initUsers();
    updateChat();
}


const initUsers = async () => {
    const usersDiv = document.getElementById("users");

    try {
        const users = await authGet("/api/users");
        for (let user of users) {
            console.log(user)
            const newElement = document.createElement("a");
            newElement.classList.add('flex', 'list-item');
            newElement.onclick = function () {
                history.pushState(null, '', `/chat?id=${user.id}`);
                updateChat();
            };
            newElement.innerHTML = `
                <img class="avatar" src="${user.avatar}" alt="">
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



const updateChat = async () => {
    const element = document.getElementById("conversation");
    if (!element)
        return
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (!id)
        return (element.innerHTML = "<h5>Start a conversation.</h5>")

    

    element.innerHTML = `
    <div class="header">
    <h2>Youness Lagmah</h2>
    </div>
    
    <div class="conversation scroll-box pv-5">
 
    
    <div class="mh-5">
    <div class="flex center">
        <img class="avatar small mr-5"
            src="https://images.pexels.com/photos/33545082/pexels-photo-33545082.jpeg" alt="">
        <div class="input flex flex-1">
            <input class="pl-3" type="text" placeholder="Type a message..." />
            <button>Send</button>
        </div>
    </div>
    
    <div class="mt-5 inline-block gap-medium">
        <button class="btn-secondary">
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

        <div class="list">
            <div class="flex list-item active">
                <img class="avatar" src="https://images.pexels.com/photos/33545082/pexels-photo-33545082.jpeg"
                    alt="">
                <div class="list-item-content">
                    <h4>Youness Lagmah</h4>
                    <span>wech</span>
                </div>
            </div>
            <div class="flex list-item">
                <img class="avatar" src="https://images.pexels.com/photos/33545082/pexels-photo-33545082.jpeg"
                    alt="">
                <div class="list-item-content">
                    <h4>Youness Lagmah</h4>
                    <span>wech</span>
                </div>
            </div>

        </div>

        <h3 class="mh-5 mt-5 mb-3">All users</h3>

        <div id="users" class="list">
        </div>
    </div>

</div>

<div class="right section">
    <div id="conversation" class="h-full flex-column">
        
    </div>
</div>
</section>
`;