
// this is the main async function
// we make our async logic here and call resolve or reject appropriately
function promiseArg(resolve: Function, reject: Function)
{
	var success: boolean = true;
	if (success)
	{
		// this line call () => resolve("Success") function after 1000
		setTimeout(() => resolve("Success"), 1000);
		// calling resolve calls resolveHandler
	}
	else
		reject("Error");
}

//							  the value resolved will be string
const myPromise = new Promise<string>(promiseArg);

// Parameter 'successMessage' implicitly has an 'any' type.
	// add types to args, otherwise, it will be any
function resolveHandler(successMessage: string)
{
	// handle success
	console.log(successMessage)
}

function rejectHandler(successMessage: string)
{
	// handle error
	console.log(successMessage)
}

myPromise.then(resolveHandler, rejectHandler);
