// module.c
#include <stdio.h>
#include "module.h"

// This is the function that implements our logic.
// It matches the 'module_function_t' signature.
int my_plugin_function(const char *input) {
    printf("Plugin received: %s\n", input);
    printf("Plugin is processing the input...\n");

    // Simple "security check": reject if the input is "hack"
    if (strcmp(input, "hack") == 0) {
        printf("BLOCKED: Malicious input detected!\n");
        return 0; // Return 0 for failure (like NGX_HTTP_FORBIDDEN)
    }

    printf("ALLOWED: Input looks fine.\n");
    return 1; // Return 1 for success (like NGX_OK)
}

// Another example function
const char* get_version(void) {
    return "Awesome Plugin v1.0";
}

// We don't need a main() function here. This is a library.