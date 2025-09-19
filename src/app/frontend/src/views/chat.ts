export async function Chat()
{
	document.getElementById("main-views")!.innerHTML = ChatView;
}



const ChatView = `
<section class="flex w-full h-screen">

    <div class="basis-1/3 h-screen">
            
        <div class="mt-2">
            <div class="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-gray-600 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-500">
            <div class="shrink-0 text-base text-gray-400 select-none sm:text-sm/6">$</div>
                <input type="text" name="search" placeholder="Search" class="block min-w-0 grow bg-gray-800 py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6" />
            </div>
        </div>

    </div>

    <div class="flex-1 h-screen">


    </div>
    
</section>
`;