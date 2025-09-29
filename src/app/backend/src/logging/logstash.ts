
export const registerLogger = async (server) => {

    server.addHook('onRequest', (request, reply, done) => {
        done();

        fetch(
            "http://logstash",
            {
                "method": "POST",
                body: JSON.stringify(
                    {
                        "method": request.method,
                        "path": request.url
                    }
                )
            }
        ).catch((e) => { })
    });

}
