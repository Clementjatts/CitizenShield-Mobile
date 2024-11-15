import React, { useState } from 'react';
import { StyleSheet, TextInput, View, SafeAreaView, StatusBar, Pressable, Alert, Modal, FlatList, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text } from '../components/Themed';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';
import { router } from 'expo-router';
import { db, auth } from '../config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { handleFirebaseError } from '../utils/errorHandler';

const SUBJECT_OPTIONS = [
    'Suspicious Activity',
    'Traffic Incident',
    'Fire',
    'Medical Emergency',
    'Natural Disaster',
    'Crime in Progress',
    'Kidnap Attempt',
    'Missing Person',
    'Hostage Situation',
    'Hazardous Material',
    'Power Outage',
    'Other Emergency'
];

const NIGERIAN_LOCATIONS = {
    'Abia': [
        'Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano',
        'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato',
        'Obi Ngwa', 'Ohafia', 'Osisioma', 'Ugwunagbo',
        'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South',
        'Umu Nneochi'
    ],
    'Adamawa': [
        'Demsa', 'Fufore', 'Ganye', 'Gayuk', 'Gombi', 'Grie',
        'Hong', 'Jada', 'Lamurde', 'Madagali', 'Maiha',
        'Mayo Belwa', 'Michika', 'Mubi North', 'Mubi South',
        'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North',
        'Yola South'
    ],
    'Akwa Ibom': [
        'Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim',
        'Etim Ekpo', 'Etinan', 'Ibeno', 'Ibiono Ibom', 'Ika',
        'Ikono', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu',
        'Mbo', 'Mkpat Enin', 'Nsit Atai', 'Nsit Ibom',
        'Obot Akara', 'Okobo', 'Onna', 'Oron', 'Oruk Anam',
        'Uruan', 'Urue Offong/Oruko'
    ],
    'Anambra': [
        'Aguata', 'Awka North', 'Awka South', 'Anambra East',
        'Anambra West', 'Dunukofia', 'Ekwusigo', 'Idemili North',
        'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North',
        'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South',
        'Orumba North', 'Orumba South', 'Oyi'
    ],
    'Bauchi': [
        'Alkaleri', 'Bauchi', 'Bogoro', 'Dambam', 'Darazo',
        'Dass', 'Gamawa', 'Ganjuwa', 'Kirfi', 'Misau',
        'Ningi', 'Shira', 'Tafawa Balewa', 'Toro', 'Warji',
        'Zaki'
    ],
    'Bayelsa': [
        'Brass', 'Ekeremor', 'Kolokuma/Opokuma', 'Nembe',
        'Ogbia', 'Sagbama', 'Southern Ijaw', 'Yenagoa'
    ],
    'Benue': [
        'Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma',
        'Gwer East', 'Gwer West', 'Katsina-Ala', 'Konshisha',
        'Logo', 'Makurdi', 'Obi', 'Ogbadibo', 'Ohimini',
        'Oju', 'Tarka', 'Ukum', 'Vandeikya'
    ],
    'Borno': [
        'Abadam', 'Askira/Uba', 'Bama', 'Bayo', 'Chibok',
        'Damboa', 'Dikwa', 'Gubio', 'Guzamala', 'Hawul',
        'Jere', 'Kaga', 'Kala/Balge', 'Konduga', 'Mafa',
        'Magumeri', 'Maiduguri', 'Ngala', 'Nganzai',
        'Shani'
    ],
    'Cross River': [
        'Akpabuyo', 'Bakassi', 'Calabar Municipal', 'Calabar South',
        'Ekureku', 'Ikom', 'Obubra', 'Obudu', 'Odukpani',
        'Ogoja', 'Yala'
    ],
    'Delta': [
        'Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu',
        'Ethiope East', 'Ethiope West', 'Ika North East',
        'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East',
        'Ndokwa West', 'Okpe', 'Oshimili North', 'Oshimili South',
        'Patani', 'Sapele', 'Udu', 'Ughelli North',
        'Ughelli South', 'Warri North', 'Warri South',
        'Warri South West'
    ],
    'Ebonyi': [
        'Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi',
        'Ezza North', 'Ezza South', 'Ikwo', 'Ishielu',
        'Ivo', 'Ohaozara', 'Ohaukwu', 'Onicha'
    ],
    'Edo': [
        'Akoko Edo', 'Esan Central', 'Esan North-East',
        'Esan South-East', 'Etsako Central', 'Etsako East',
        'Etsako West', 'Oredo', 'Orhionmwon', 'Ovia North-East',
        'Ovia South-West', 'Uhunmwonde'
    ],
    'Ekiti': [
        'Ado Ekiti', 'Ekiti East', 'Ekiti South-West',
        'Ekiti West', 'Emure', 'Irepodun/Ifelodun',
        'Ise/Orun', 'Moba', 'Oye'
    ],
    'Enugu': [
        'Awgu', 'Enugu East', 'Enugu North', 'Enugu South',
        'Ezeagu', 'Igbo Etiti', 'Igbo Eze North',
        'Igbo Eze South', 'Isi Uzo', 'Nkanu East',
        'Nkanu West', 'Oji River', 'Udenu', 'Udi',
        'Nsukka'
    ],
    'Gombe': [
        'Akko', 'Balanga', 'Billiri', 'Dukku', 'Gombe',
        'Kaltungo', 'Kwami', 'Nafada', 'Shongom',
        'Yamaltu/Deba'
    ],
    'Imo': [
        'Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano',
        'Ezinihitte', 'Ideato North', 'Ideato South',
        'Ihitte/Uboma', 'Isiala Mbano', 'Isu',
        'Mbaitoli', 'Ngor Okpala', 'Njaba', 'Nkwere',
        'Obowo', 'Oguta', 'Ohaji/Egbema', 'Orlu',
        'Orsu', 'Owerri Municipal', 'Owerri North',
        'Owerri West'
    ],
    'Jigawa': [
        'Auyo', 'Babura', 'Birnin Kudu', 'Buji', 'Dutse',
        'Garki', 'Gumel', 'Hadejia', 'Kazaure',
        'Kiri Kasama', 'Maigatari', 'Malam Madori',
        'Miga', 'Ringim', 'Sule Tankarkar', 'Yankwashi'
    ],
    'Kaduna': [
        'Birnin Gwari', 'Chikun', 'Giwa', 'Igabi',
        'Jaba', 'Jema\'a', 'Kachia', 'Kaduna North',
        'Kaduna South', 'Kagarko', 'Kaura', 'Kudan',
        'Lere', 'Makarfi', 'Sabon Gari', 'Sanga',
        'Soba', 'Zaria'
    ],
    'Kano': [
        'Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi',
        'Dala', 'Dawakin Kudu', 'Dawakin Tofa',
        'Doguwa', 'Fagge', 'Gaya', 'Gezawa',
        'Gwarzo', 'Kano Municipal', 'Karaye',
        'Kibiya', 'Kiru', 'Kumbotso', 'Madobi',
        'Makoda', 'Minjibir', 'Nasarawa', 'Rogo',
        'Shanono', 'Sumaila', 'Tarauni', 'Tofa',
        'Tsanyawa', 'Ungogo', 'Warawa', 'Wudil'
    ],
    'Kogi': [
        'Adavi', 'Ajaokuta', 'Bassa', 'Dekina',
        'Ibaji', 'Idah', 'Igalamela/Odolu',
        'Ijumu', 'Kabba/Bunu', 'Kogi', 'Lokoja',
        'Mopa-Muro', 'Ofu', 'Ogori/Magongo',
        'Okehi', 'Okene', 'Omala', 'Yagba East',
        'Yagba West'
    ],
    'Kwara': [
        'Asa', 'Baruten', 'Ekiti', 'Ifelodun',
        'Ilorin East', 'Ilorin South', 'Ilorin West',
        'Irepodun', 'Isin', 'Kaiama', 'Moro',
        'Offa', 'Oke Ero', 'Oyun', 'Pategi'
    ],
    'Lagos': [
        'Agege', 'Ajeromi-Ifelodun', 'Alimosho',
        'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe',
        'Eti Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye',
        'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island',
        'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo',
        'Shomolu', 'Surulere'
    ],
    'Nasarawa': [
        'Akwanga', 'Doma', 'Karshi', 'Keffi',
        'Keffi', 'Nasarawa', 'Nasarawa Eggon',
        'Obi', 'Toto', 'Wamba'
    ],
    'Niger': [
        'Agaie', 'Agwara', 'Bida', 'Borgu',
        'Chanchaga', 'Edati', 'Gbako',
        'Gurara', 'Katcha', 'Kontagora',
        'Lavun', 'Magama', 'Mariga',
        'Mashegu', 'Mokwa', 'Paikoro',
        'Rafi', 'Rijau', 'Shiroro',
        'Suleja', 'Tafa', 'Wushishi'
    ],
    'Ogun': [
        'Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota',
        'Egbado North', 'Egbado South', 'Ifo',
        'Ijebu East', 'Ijebu North', 'Ijebu North East',
        'Ijebu Ode', 'Obafemi-Owode', 'Odeda',
        'Odogbolu', 'Remo North', 'Sagamu',
        'Yewa North', 'Yewa South'
    ],
    'Ondo': [
        'Akoko North-East', 'Akoko North-West', 'Akoko South-East',
        'Akoko South-West', 'Akure North', 'Akure South',
        'Ese Odo', 'Idanre', 'Ifedore',
        'Ilaje', 'Ile Oluji/Okeigbo', 'Odigbo',
        'Okitipupa', 'Ondo East', 'Ondo West',
        'Ose', 'Owo'
    ],
    'Osun': [
        'Aiyedade', 'Aiyedire', 'Atakunmosa East',
        'Atakunmosa West', 'Boluwaduro', 'Boripe',
        'Ife East', 'Ife North', 'Ife South',
        'Ilesa East', 'Ilesa West', 'Isokan',
        'Iwo', 'Odo Otin', 'Osogbo',
        'Ola Oluwa', 'Olorunda', 'Oriade',
        'Orolu', 'Atakumosa West'
    ],
    'Oyo': [
        'Afijio', 'Akinyele', 'Atiba', 'Atisbo',
        'Egbeda', 'Ibadan North', 'Ibadan North-East',
        'Ibadan North-West', 'Ibadan South-East',
        'Ibadan South-West', 'Ibarapa Central',
        'Ibarapa East', 'Ibarapa North', 'Ido',
        'Ogbomosho North', 'Ogbomosho South',
        'Oyo East', 'Oyo West', 'Saki East',
        'Saki West', 'Surulere'
    ],
    'Plateau': [
        'Barkin Ladi', 'Bassa', 'Bokkos', 'Jos East',
        'Jos North', 'Jos South', 'Kanam',
        'Kanke', 'Langtang North', 'Langtang South',
        'Mangu', 'Pankshin', 'Qua\'an Pan',
        'Riyom', 'Shendam', 'Wase'
    ],
    'Rivers': [
        'Abua/Odual', 'Ahoada East', 'Ahoada West', 'Akuku-Toru',
        'Andoni', 'Asari-Toru', 'Bonny', 'Degema',
        'Emohua', 'Etche', 'Gokana', 'Ikwerre',
        'Khana', 'Obio-Akpor', 'Ogba/Egbema/Ndoni',
        'Ogu/Bolo', 'Okrika', 'Omuma', 'Port Harcourt',
        'Tai'
    ],
    'Sokoto': [
        'Binji', 'Bodinga', 'Dange Shuni', 'Gada',
        'Goronyo', 'Gudu', 'Illela', 'Kebbe',
        'Kware', 'Rabah', 'Sabon Birni', 'Sokoto North',
        'Sokoto South', 'Tambuwal', 'Wamakko',
        'Wurno', 'Yabo'
    ],
    'Taraba': [
        'Ardo Kola', 'Bali', 'Donga', 'Gashaka',
        'Gassol', 'Ibi', 'Jalingo', 'Karim Lamido',
        'Kona', 'Lau', 'Sardauna', 'Takum',
        'Ussa', 'Wukari', 'Yorro', 'Zing'
    ],
    'Yobe': [
        'Bade', 'Bursari', 'Damaturu', 'Fika',
        'Fune', 'Geidam', 'Gujba', 'Gulani',
        'Jakusko', 'Karasuwa', 'Machina', 'Nangere',
        'Nguru', 'Potiskum', 'Tarmuwa', 'Yunusari'
    ],
    'Zamfara': [
        'Anka', 'Bakura', 'Birnin Magaji', 'Bukkuyum',
        'Gummi', 'Gusau', 'Isa', 'Kaura Namoda',
        'Maradun', 'Shinkafi', 'Talata Mafara',
        'Zamfara'
    ],
    'FCT': [
        'Abaji', 'Bwari', 'Gwagwalada', 'Kuje',
        'Abuja Municipal', 'Nyanya'
    ]
};

export default function CreatePostScreen() {
    const { colors } = useTheme();
    const [subject, setSubject] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedLocality, setSelectedLocality] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [subjectModalVisible, setSubjectModalVisible] = useState(false);
    const [stateModalVisible, setStateModalVisible] = useState(false);
    const [localityModalVisible, setLocalityModalVisible] = useState(false);

    const handleSubmit = async () => {
        if (!subject || !selectedState || !selectedLocality || !content.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);

        try {
            const postData = {
                title: subject,
                content,
                state: selectedState,
                locality: selectedLocality,
                authorId: auth.currentUser?.uid,
                createdAt: new Date(),
                replies: 0,
                likes: 0
            };

            await addDoc(collection(db, 'posts'), postData);

            Alert.alert('Success', 'Your post has been submitted');
            router.push('/(main)/forum');
        } catch (error: unknown) {
            const errorMessage = handleFirebaseError(error);
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const renderOptionItem = ({ item, setterFunction, setModalVisible }:
        { item: string, setterFunction: (value: string) => void, setModalVisible: (value: boolean) => void }) => (
        <Pressable
            style={[styles.optionItem, { borderBottomColor: colors.border }]}
            onPress={() => {
                setterFunction(item);
                setModalVisible(false);
            }}
        >
            <Text style={{ color: colors.text }}>{item}</Text>
        </Pressable>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Pressable
                            onPress={() => router.push('/(main)/forum')} // Changed from router.back()
                            style={styles.backButton}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </Pressable>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Emergency Post</Text>
                    </View>
                    <Pressable
                        style={[styles.selector, { backgroundColor: colors.card }]}
                        onPress={() => setSubjectModalVisible(true)}
                    >
                        <Text style={{ color: subject ? colors.text : colors.border }}>
                            {subject || 'Select emergency type'}
                        </Text>
                        <Ionicons name="chevron-down" size={24} color={colors.text} />
                    </Pressable>
                    <Pressable
                        style={[styles.selector, { backgroundColor: colors.card }]}
                        onPress={() => setStateModalVisible(true)}
                    >
                        <Text style={{ color: selectedState ? colors.text : colors.border }}>
                            {selectedState || 'Select State'}
                        </Text>
                        <Ionicons name="chevron-down" size={24} color={colors.text} />
                    </Pressable>
                    {selectedState && (
                        <Pressable
                            style={[styles.selector, { backgroundColor: colors.card }]}
                            onPress={() => setLocalityModalVisible(true)}
                        >
                            <Text style={{ color: selectedLocality ? colors.text : colors.border }}>
                                {selectedLocality || 'Select Locality'}
                            </Text>
                            <Ionicons name="chevron-down" size={24} color={colors.text} />
                        </Pressable>
                    )}
                    <TextInput
                        style={[styles.contentInput, { color: colors.text, backgroundColor: colors.card }]}
                        placeholder="Describe the emergency situation"
                        placeholderTextColor={colors.text}
                        value={content}
                        onChangeText={setContent}
                        multiline
                        numberOfLines={5}
                    />
                    <CustomButton
                        title="Submit Emergency Post"
                        onPress={handleSubmit}
                        style={styles.button}
                        loading={loading}
                        disabled={!subject || !selectedState || !selectedLocality || !content.trim()}
                        variant="primary"
                    />
                </ScrollView>
            </KeyboardAvoidingView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={subjectModalVisible}
                onRequestClose={() => setSubjectModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Select Emergency Type</Text>
                        <FlatList
                            data={SUBJECT_OPTIONS}
                            renderItem={({ item }) => renderOptionItem({ item, setterFunction: setSubject, setModalVisible: setSubjectModalVisible })}
                            keyExtractor={(item) => item}
                        />
                        <CustomButton
                            title="Cancel"
                            onPress={() => setSubjectModalVisible(false)}
                            variant="outline"
                            style={styles.cancelButton}
                        />
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={stateModalVisible}
                onRequestClose={() => setStateModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Select State</Text>
                        <FlatList
                            data={Object.keys(NIGERIAN_LOCATIONS)}
                            renderItem={({ item }) => renderOptionItem({
                                item,
                                setterFunction: (state) => {
                                    setSelectedState(state);
                                    setSelectedLocality('');
                                },
                                setModalVisible: setStateModalVisible
                            })}
                            keyExtractor={(item) => item}
                        />
                        <CustomButton
                            title="Cancel"
                            onPress={() => setStateModalVisible(false)}
                            variant="outline"
                            style={styles.cancelButton}
                        />
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={localityModalVisible}
                onRequestClose={() => setLocalityModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Select Locality</Text>
                        <FlatList
                            data={NIGERIAN_LOCATIONS[selectedState as keyof typeof NIGERIAN_LOCATIONS] || []}
                            renderItem={({ item }) => renderOptionItem({
                                item,
                                setterFunction: setSelectedLocality,
                                setModalVisible: setLocalityModalVisible
                            })}
                            keyExtractor={(item) => item}
                        />
                        <CustomButton
                            title="Cancel"
                            onPress={() => setLocalityModalVisible(false)}
                            variant="outline"
                            style={styles.cancelButton}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
    },
    selector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 50,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    contentInput: {
        height: 150,
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        textAlignVertical: 'top',
    },
    button: {
        marginTop: 20,
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        maxHeight: '80%',
        borderRadius: 20,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    optionItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    cancelButton: {
        marginTop: 20,
    },
});