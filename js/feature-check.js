(async () => {

    const checkEssentialFeatures = () => {
        try {
            const checkES6 = () => {
                try {
                    new Function("const x = () => {}; class Foo {};");
                    return true;
                } catch {
                    return false;
                }
            };

            const features = {
                es6: checkES6(),
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
                        return !!svg.createSVGRect; 
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

            const results = {
                es6: features.es6,
                css: features.css(),
                wasm: features.wasm(),
                svg: features.svg(),
                webComponents: features.webComponents()
            };

            return {
                allSupported: Object.values(results).every(Boolean),
                results
            };

        } catch (error) {
            console.error('Critical check failure:', error);
            return { allSupported: false, results: {} };
        }
    };

    const checkLocalFirstFeatures = async () => {
        try {
            const hasIndexedDB = 'indexedDB' in window;
            const hasServiceWorker = 'serviceWorker' in navigator;
            
            const storagePersisted = navigator.storage && navigator.storage.persist 
                ? await navigator.storage.persisted() 
                : false;

            return {
                indexedDB: hasIndexedDB,
                serviceWorker: hasServiceWorker,
                storagePersisted: storagePersisted
            };

        } catch (error) {
            console.error('Local-first check failed:', error);
            return {
                indexedDB: false,
                serviceWorker: false,
                storagePersisted: false
            };
        }
    };

    const testImageFormat = (format) => {
        return new Promise((resolve) => {
            const timer = setTimeout(() => resolve(false), 500);
            
            try {
                const img = new Image();
                img.onload = img.onerror = () => {
                    clearTimeout(timer);
                    resolve(img.width > 0);
                };
                
                img.src = format === 'webp' ?
                    'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=' :
                    'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///3Wfhw8C+RAAAABU1w==';
            } catch (error) {
                console.error(`Test error ${format.toUpperCase()}:`, error);
                clearTimeout(timer);
                resolve(false);
            }
        });
    };

    try {
        
        const [featureCheck, localFirstCheck] = await Promise.all([
            checkEssentialFeatures(),
            checkLocalFirstFeatures()
        ]);
        
        const allFeatures = {
            ...featureCheck.results,
            ...localFirstCheck
        };
        
        const allSupported = Object.values(allFeatures).every(Boolean);
        if (!allSupported) {
            console.log('Failed features:', allFeatures);
            throw new Error('Essential features not available');
        }

        const [webpSupported, avifSupported] = await Promise.all([
            testImageFormat('webp'),
            testImageFormat('avif')
        ]);

        if (!webpSupported && !avifSupported) {
            console.log('Image support:', { webp: webpSupported, avif: avifSupported });
            throw new Error('No supported image formats available');
        }

        localStorage.setItem('features-valid', 'true');
        document.documentElement.classList.add('features-ready');

    } catch (error) {
        console.error('Redirecting to fallback:', error.message);
        try {
            localStorage.removeItem('features-valid');
            window.stop();
            window.location.replace('default/unsupported.html');
        } catch (redirectError) {
            console.error('Redirection failed:', redirectError);
        }
    }
})();