import { type DeliverableOpenMode } from './open-file.js';
import { type SettingsCopy, type SettingsCopyKey } from './settings-copy.js';
import { type SkillStatusProbe } from './skill-status.js';
export interface OpenPrefs {
    getSnapshot: () => {
        deliverableOpenMode?: DeliverableOpenMode;
    };
    subscribe: (fn: () => void) => () => void;
    actions: {
        setDeliverableOpenMode: (value: DeliverableOpenMode) => void;
    };
}
export interface BetterDisplaySettingsInjected {
    prefs: OpenPrefs;
    copy?: SettingsCopy;
    languageTag?: string;
    checkSkill: SkillStatusProbe;
}
type SettingsProps = BetterDisplaySettingsInjected & {
    /** Official settings.section owner share; unused here. */
    close?: () => void;
    t?: (key: SettingsCopyKey) => string;
};
export declare function SettingsSection(props: SettingsProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=SettingsSection.d.ts.map