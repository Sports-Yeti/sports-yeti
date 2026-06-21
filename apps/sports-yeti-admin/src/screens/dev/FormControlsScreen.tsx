import { useNavigation } from '@react-navigation/native';
import { FormControlsGallery } from '@sports-yeti/ui';
import { PageHeader, PageScroll, type AdminRouteName } from '../../admin';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

/**
 * Live reference for every primitive in @sports-yeti/ui.
 * Sidebar entry: "Form controls" under "System".
 */
export function FormControlsScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;

  return (
    <PageScroll>
      <PageHeader
        title="Form controls"
        subtitle="Live showcase of every primitive in @sports-yeti/ui — Input, PasswordInput, TextArea, NumberInput, Toggle, Checkbox, RadioGroup, Select, Combobox, DatePicker, FileUpload."
        crumbs={[{ label: 'System' }, { label: 'Form controls' }]}
        onNavigate={(r) => navigation.navigate(r)}
      />
      <FormControlsGallery />
    </PageScroll>
  );
}
