type ThemeTransition = {
    finished: Promise<void>;
};

type ViewTransitionDocument = Document & {
    startViewTransition?: (updateCallback: () => void) => ThemeTransition;
};

export const isDarkTheme = () => document.documentElement.classList.contains('dark');

const applyThemePreference = (darkMode: boolean) => {
    localStorage.setItem('darkMode', String(darkMode));
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
    window.dispatchEvent(new CustomEvent('careerflow-theme-change', { detail: { darkMode } }));
};

export function setThemePreference(darkMode: boolean, origin?: { x: number; y: number }) {
    const transitionDocument = document as ViewTransitionDocument;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!transitionDocument.startViewTransition || prefersReducedMotion) {
        applyThemePreference(darkMode);
        return;
    }

    const x = origin?.x ?? window.innerWidth - 48;
    const y = origin?.y ?? 48;
    const maxX = Math.max(x, window.innerWidth - x);
    const maxY = Math.max(y, window.innerHeight - y);
    const endRadius = Math.hypot(maxX, maxY);

    document.documentElement.style.setProperty('--theme-wave-x', `${x}px`);
    document.documentElement.style.setProperty('--theme-wave-y', `${y}px`);
    document.documentElement.style.setProperty('--theme-wave-end', `${endRadius}px`);
    document.documentElement.classList.add('theme-wave-running');

    const transition = transitionDocument.startViewTransition(() => applyThemePreference(darkMode));

    transition.finished.finally(() => {
        document.documentElement.classList.remove('theme-wave-running');
        document.documentElement.style.removeProperty('--theme-wave-x');
        document.documentElement.style.removeProperty('--theme-wave-y');
        document.documentElement.style.removeProperty('--theme-wave-end');
    });
}
