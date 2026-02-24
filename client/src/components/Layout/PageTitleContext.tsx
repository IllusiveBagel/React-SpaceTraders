import {
    createContext,
    type PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

type PageTitleContextValue = {
    title: string;
    setTitle: (title: string) => void;
};

const PageTitleContext = createContext<PageTitleContextValue | undefined>(
    undefined,
);

const PageTitleProvider = ({ children }: PropsWithChildren) => {
    const [title, setTitle] = useState("Home");

    const value = useMemo(() => ({ title, setTitle }), [title]);

    return (
        <PageTitleContext.Provider value={value}>
            {children}
        </PageTitleContext.Provider>
    );
};

const usePageTitleContext = () => {
    const context = useContext(PageTitleContext);

    if (!context) {
        throw new Error(
            "usePageTitleContext must be used within PageTitleProvider",
        );
    }

    return context;
};

const usePageTitle = (title: string) => {
    const { setTitle } = usePageTitleContext();

    useEffect(() => {
        setTitle(title);
    }, [setTitle, title]);
};

export { PageTitleProvider, usePageTitle, usePageTitleContext };
