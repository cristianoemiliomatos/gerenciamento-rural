import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

import { BrandMark } from '@/components/BrandMark';
import { PageContainer } from '@/components/PageContainer';
import { palette } from '@/constants/theme';

const items = [
  { icon: 'business-outline' as const, title: 'Dados da propriedade', description: 'Nome, localização e área total' },
  { icon: 'notifications-outline' as const, title: 'Notificações', description: 'Alertas de validade e estoque' },
  { icon: 'cloud-upload-outline' as const, title: 'Backup', description: 'Salvar e restaurar dados' },
  { icon: 'information-circle-outline' as const, title: 'Sobre o app', description: 'Versão 1.0.0' },
];

export default function MoreScreen() {
  return <PageContainer><View style={styles.brand}><BrandMark /><Text style={styles.version}>Sua central de gestão rural</Text></View><View style={styles.profile}><View style={styles.avatar}><Ionicons name="person-outline" size={23} color={palette.green} /></View><View><Text style={styles.profileName}>Lucas Andrade</Text><Text style={styles.profileMail}>lucas@email.com</Text></View></View><View style={styles.menu}>{items.map((item) => <TouchableOpacity key={item.title} style={styles.item}><View style={styles.itemIcon}><Ionicons name={item.icon} size={19} color={palette.green} /></View><View style={styles.itemCopy}><Text style={styles.itemTitle}>{item.title}</Text><Text style={styles.itemDescription}>{item.description}</Text></View><Ionicons name="chevron-forward" size={17} color={palette.muted} /></TouchableOpacity>)}</View><TouchableOpacity style={styles.logout}><Ionicons name="log-out-outline" size={19} color={palette.danger} /><Text style={styles.logoutText}>Sair</Text></TouchableOpacity></PageContainer>;
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', paddingVertical: 7 },
  version: { color: palette.muted, fontSize: 11, marginTop: 7 },
  profile: { alignItems: 'center', backgroundColor: palette.mint, borderRadius: 16, flexDirection: 'row', gap: 11, padding: 15 },
  avatar: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 25, height: 46, justifyContent: 'center', width: 46 },
  profileName: { color: palette.darkGreen, fontSize: 14, fontWeight: '800' }, profileMail: { color: palette.muted, fontSize: 11, marginTop: 3 },
  menu: { backgroundColor: '#FFFFFF', borderColor: palette.border, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  item: { alignItems: 'center', borderBottomColor: palette.border, borderBottomWidth: 1, flexDirection: 'row', gap: 11, minHeight: 70, paddingHorizontal: 13 },
  itemIcon: { alignItems: 'center', backgroundColor: palette.mint, borderRadius: 18, height: 36, justifyContent: 'center', width: 36 }, itemCopy: { flex: 1 }, itemTitle: { color: palette.darkGreen, fontSize: 13, fontWeight: '700' }, itemDescription: { color: palette.muted, fontSize: 10, marginTop: 3 },
  logout: { alignItems: 'center', flexDirection: 'row', gap: 9, paddingHorizontal: 5, paddingVertical: 13 }, logoutText: { color: palette.danger, fontSize: 13, fontWeight: '800' },
});
