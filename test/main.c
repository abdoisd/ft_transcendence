// main.c
#include <stdio.h>
#include <stdlib.h>
#include <dlfcn.h> // The key header for dynamic loading
#include "module.h" // Include the common header for the function type

int main() {
    void *handle;           // Handle to the opened library, like a file pointer
    char *error;            // For catching errors

    // 1. Load the shared library (Like Nginx's 'load_module')
    // 'RTLD_LAZY' means resolve symbols as needed.
    handle = dlopen("./libmymodule.so", RTLD_LAZY);
    if (!handle) {
        fprintf(stderr, "Could not load library: %s\n", dlerror());
        exit(1);
    }

    // Clear any existing errors
    dlerror();

    // 2. Find the address of the function we want to call (The "Registration")
    // This is like Nginx looking for the 'ngx_http_modsecurity_handler' function.
    module_function_t process_func = (module_function_t)dlsym(handle, "my_plugin_function");
    if ((error = dlerror()) != NULL) {
        fprintf(stderr, "Could not find function: %s\n", error);
        dlclose(handle);
        exit(1);
    }

    // 3. Let's also get the version function for demonstration
    module_version_t version_func = (module_version_t)dlsym(handle, "get_version");
    if ((error = dlerror()) != NULL) {
        fprintf(stderr, "Could not find version function: %s\n", error);
    } else {
        printf("Loaded module: %s\n", version_func());
    }

    // 4. **Call the function from the loaded library!**
    // This is the crucial part. The main program is now executing code
    // that was not part of its original binary.
    printf("\n--- Testing Plugin ---\n");
    int result1 = process_func("hello world");
    printf("Main program got return code: %d (Allowed)\n\n", result1);

    int result2 = process_func("hack");
    printf("Main program got return code: %d (Blocked)\n\n", result2);

    // 5. Unload the library (Nginx doesn't do this until shutdown)
    dlclose(handle);
    return 0;
}
