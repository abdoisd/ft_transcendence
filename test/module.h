// module.h
#ifndef MODULE_H
#define MODULE_H
#include <string.h>

// Define a function pointer type for the function we expect to find in the module.
// This is the 'hook' signature. In Nginx, this is more complex, using structs.
typedef int (*module_function_t)(const char *input);

// A function to get the version of the module (another example function)
typedef const char* (*module_version_t)(void);

#endif