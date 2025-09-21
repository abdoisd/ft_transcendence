import { route } from "../frontend";
import { authGet, authPost } from "../utils/http_utils";

export async function Chat() {
    document.getElementById("main-views")!.innerHTML = ChatView;

    initUsers();
}


const initUsers = async () => {
    const usersDiv = document.getElementById("users");

    try {
        const users = await authGet("/api/users");
        for (let user of users) {
            const newElement = document.createElement("a");
            newElement.classList.add('flex', 'list-item');
            newElement.onclick = function () {
                history.pushState(null, '', `/chat?id=${user.id}`);
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
    <div id="conversation" class="h-full flex-column">
        
    </div>
</div>
</section>
`;