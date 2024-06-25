export const importLocalFile = () =>
    new Promise<string>((resolve, reject) => {
        if (window.File) {
            const elm = document.createElement("input");
            elm.type = "file";
            elm.addEventListener("change", (e: Event) => {
                if (!elm.files) return;
                const fileReader = new FileReader();
                fileReader.onload = (e: ProgressEvent<FileReader>) => {
                    const file = e.target?.result;
                    if (typeof file === "string") {
                        resolve(file);
                    }
                };
                fileReader.readAsText(elm.files[0]);
            });

            elm.click();
        }
    });
