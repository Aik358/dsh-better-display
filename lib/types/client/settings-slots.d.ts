import type { SettingsCopyKey } from './settings-copy.js';
export interface SettingsSectionOwnerProps {
    close: () => void;
}
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        'settings.section': {
            kind: 'list';
            scope: 'root';
            owner: SettingsSectionOwnerProps;
        };
    }
    interface LocaleNamespaceMap {
        'better-display': SettingsCopyKey;
    }
}
