(async () => {

    const checkEssentialFeatures = () => {
        try {
            const features = {
                css: () => {
                    try {
                        return CSS.supports('(--test: 0)') && CSS.supports('color', 'red');
                    } catch (e) {
                        return false;
                    }
                },
                wasm: () => {
                    try {
                        return 'WebAssembly' in window;
                    } catch (e) {
                        return false;
                    }
                },
                svg: () => {
                    try {
                        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        return svg.toString().includes('SVG');
                    } catch (e) {
                        return false;
                    }
                },
                webComponents: () => {
                    try {
                        return 'customElements' in window;
                    } catch (e) {
                        return false;
                    }
                }
            };

            return Object.values(features).every(fn => {
                try {
                    return fn();
                } catch (e) {
                    return false;
                }
            });

        } catch (error) {
            console.error('Critical check failure:', error);
            return false;
        }
    };

    
    const testImageFormat = (format) => {
        return new Promise((resolve) => {
            try {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                
                img.src = format === 'webp' ?
                    'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=' :
                    'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///3Wfhw8C+RAAAABU1w==';
            } catch (error) {
                console.error(`Test error ${format.toUpperCase()}:`, error);
                resolve(false);
            }
        });
    };

    // If the user's browser does not support CSS, Wasm, SVG, 
    // microfrontends (web components), WebP or AVIF 
    // (or the tests fail); redirect to the unsupported page.
    try {     
        if (!checkEssentialFeatures()) {
            throw new Error('Essential features not available');
        }

        const [webpSupported, avifSupported] = await Promise.all([
            testImageFormat('webp'),
            testImageFormat('avif')
        ]);

     
        if (!webpSupported || !avifSupported) {
            throw new Error('Required image format not supported');
        }

        document.documentElement.classList.add('features-ready');

    } catch (error) {
        console.error('Redirecting to fallback:', error.message);
        try {
            window.stop();
            window.location.replace('default/unsupported.html');
        } catch (redirectError) {
            console.error('Redirection failed:', redirectError);
        }
    }
})();