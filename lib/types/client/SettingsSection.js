import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { deliverableOpenModeOf } from './open-file.js';
import { settingsCopyFor } from './settings-copy.js';
import { CONVENTIONAL_SKILL_ROOTS, detectGenerativeMcpappsSkill, shortestInstallCommand } from './skill-status.js';
import css from './SettingsSection.module.css';
function text(props, copy, key) {
    if (typeof props.t === 'function') {
        try {
            const value = props.t(key);
            if (typeof value === 'string' && value.length > 0 && value !== key)
                return value;
        }
        catch {
            // Fall through to the bundled dictionaries.
        }
    }
    return copy[key];
}
export function SettingsSection(props) {
    const copy = props.copy ?? settingsCopyFor(props.languageTag);
    const mode = deliverableOpenModeOf(useSyncExternalStore(props.prefs.subscribe, () => props.prefs.getSnapshot()?.deliverableOpenMode, () => 'external'));
    const setMode = (value) => {
        props.prefs.actions.setDeliverableOpenMode(value);
    };
    const on = mode === 'sidebar';
    const [skill, setSkill] = useState();
    const [checking, setChecking] = useState(false);
    const recheck = useCallback(async () => {
        setChecking(true);
        try {
            setSkill(await detectGenerativeMcpappsSkill(props.checkSkill));
        }
        catch {
            setSkill({
                name: 'generative-mcpapps',
                installed: false,
                via: null,
                roots: [],
                hostReached: false,
            });
        }
        finally {
            setChecking(false);
        }
    }, [props.checkSkill]);
    useEffect(() => { void recheck(); }, [recheck]);
    return (_jsxs("div", { className: css.section, "data-better-display-settings": true, children: [_jsxs("div", { className: css.row, children: [_jsxs("div", { className: css.rowText, children: [_jsx("div", { className: css.title, children: text(props, copy, 'openTitle') }), _jsx("div", { className: css.desc, children: text(props, copy, 'openDescription') })] }), _jsx("button", { type: "button", role: "switch", "aria-checked": on, className: css.switch, "data-on": on || undefined, "data-better-display-open-mode": mode, onClick: () => { setMode(on ? 'external' : 'sidebar'); } })] }), _jsxs("section", { className: css.block, "data-better-display-skill": skill?.installed ? 'installed' : 'missing', children: [_jsx("div", { className: css.title, children: text(props, copy, 'skillTitle') }), _jsx("div", { className: css.status, children: _jsx("span", { className: css.badge, "data-ok": skill?.installed || undefined, children: skill?.installed ? text(props, copy, 'skillInstalled') : text(props, copy, 'skillMissing') }) }), _jsx("p", { className: css.desc, children: text(props, copy, 'skillPurpose') }), _jsx("p", { className: css.desc, children: text(props, copy, 'skillPluginNote') }), skill && !skill.installed ? (_jsxs(_Fragment, { children: [_jsx("p", { className: css.desc, children: skill.hostReached ? text(props, copy, 'skillInstall') : text(props, copy, 'skillUnavailable') }), _jsx("pre", { className: css.pre, children: shortestInstallCommand() }), _jsx("ul", { className: css.roots, "data-better-display-skill-roots": true, children: CONVENTIONAL_SKILL_ROOTS.map(root => (_jsx("li", { children: root }, root))) })] })) : null, _jsx("div", { className: css.actions, children: _jsx("button", { type: "button", className: css.button, disabled: checking, onClick: () => { void recheck(); }, children: checking ? text(props, copy, 'skillChecking') : text(props, copy, 'skillRecheck') }) })] })] }));
}
//# sourceMappingURL=SettingsSection.js.map