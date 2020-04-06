import React, { useState } from 'react'
import { StyleSheet, ScrollView, View } from 'react-native'
import { Title, TextInput, Subheading, Button, HelperText, IconButton, Text, ActivityIndicator } from 'react-native-paper';
import EmailValidator from 'email-validator';
import RNPickerSelect from 'react-native-picker-select';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { connect, ConnectedProps } from 'react-redux';
import { setUser } from '../redux/actions/User';
import { RootState } from '../redux/store';
import { User, FirebaseUser } from '../interfaces/User';
import { Language } from 'interfaces/Language';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

type EnteranceScreenNavigationProp = DrawerNavigationProp<{ Enterance: undefined, Login: undefined, Home: undefined }, 'Enterance'>;


const mapState = (state: RootState) => ({
    user: state.user,
    poems: state.poems
});

const mapDispatch = {
    setUser
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {
    navigation: EnteranceScreenNavigationProp;
};

function Signup(props: Props) {
    let allLangs: Array<Language> = ["English", "French", "German", "Italian", "Japanese", "Korean", "Portuguese", "Russian", "Spanish", "Turkish"];
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState([{ error: false, msg: '' }, { error: false, msg: '' }, { error: false, msg: '' }]);
    const [langs, setLangs] = useState<Array<Language | null>>(['English', null, null]);
    const [loading, setLoading] = useState(false);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Title style={styles.title}>Sign Up</Title>
            <Subheading>Welcome to Poemify!</Subheading>
            <View style={styles.textinput}>
                <TextInput
                    textContentType="username"
                    label="Username"
                    error={errors[0].error}
                    mode='outlined'
                    value={username}
                    onChangeText={(text) => setUsername(text)}
                />
                {
                    errors[0].error ?
                        <HelperText style={styles.errorText}>{errors[0].msg}</HelperText>
                        :
                        <View />
                }
            </View>
            <View style={styles.textinput}>
                <TextInput
                    textContentType="password"
                    label="Password"
                    error={errors[1].error}
                    secureTextEntry={true}
                    mode='outlined'
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                />
                {
                    errors[1].error ?
                        <HelperText style={styles.errorText}>{errors[1].msg}</HelperText>
                        :
                        <View />
                }
            </View>
            <View style={styles.textinputLast}>
                <TextInput
                    textContentType="emailAddress"
                    label="Email"
                    error={errors[2].error}
                    keyboardType="email-address"
                    mode='outlined'
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                />
                {
                    errors[2].error ?
                        <HelperText style={styles.errorText}>{errors[2].msg}</HelperText>
                        :
                        <View />
                }
            </View>
            <View>
                <Text style={styles.langText}>Primary Language</Text>
                <View style={styles.langContainer}>
                    <RNPickerSelect
                        items={(allLangs.filter((i) => (i !== langs[1] && i !== langs[2]))).map((i) => ({ value: i, label: i }))}
                        placeholder={{}}
                        value={langs[0]}
                        placeholderTextColor="#555"
                        onValueChange={(val) => {
                            let lang = [...langs];
                            lang[0] = val;
                            setLangs(lang);
                        }}
                    />
                </View>
            </View>
            <View>
                <Text style={styles.langText}>Second Language (Optional)</Text>
                <View style={styles.langContainer}>
                    <RNPickerSelect
                        items={(allLangs.filter((i) => (i !== langs[0] && i !== langs[2]))).map((i) => ({ value: i, label: i }))}
                        placeholder={{ label: 'Select your second language.' }}
                        value={langs[1]}
                        placeholderTextColor="#555"
                        onValueChange={(val) => {
                            let lang = [...langs];
                            lang[1] = val;
                            setLangs(lang);
                        }}
                    />
                </View>
            </View>
            <View>
                <Text style={styles.langText}>Third Language (Optional)</Text>
                <View style={styles.langContainer}>
                    <RNPickerSelect
                        items={(allLangs.filter((i) => (i !== langs[0] && i !== langs[1]))).map((i) => ({ value: i, label: i }))}
                        placeholder={{ label: 'Select your third language.' }}
                        value={langs[2]}
                        placeholderTextColor="#555"
                        onValueChange={(val) => {
                            let lang = [...langs];
                            lang[2] = val;
                            setLangs(lang);
                        }}
                    />
                </View>
            </View>
            {!loading ?

                <Button mode="contained" dark={true} style={styles.button}
                    onPress={async () => {
                        setLoading(true);
                        let myerrors = [...errors];
                        let hasError = false;
                        if (username === '') {
                            myerrors[0] = { error: true, msg: 'Username cannot be empty!' };
                            hasError = true;
                        }
                        else if (username.length < 5) {
                            myerrors[0] = { error: true, msg: 'Username must be longer than 4 characters!' };
                            hasError = true;
                        }
                        else {
                            myerrors[0] = { error: false, msg: '' };
                        }
                        if (password === '') {
                            myerrors[1] = { error: true, msg: 'Password cannot be empty!' }
                            hasError = true;
                        }
                        else if (password.length < 6) {
                            myerrors[1] = { error: true, msg: 'Password must be longer than 5 characters!' }
                            hasError = true;
                        }
                        else {
                            myerrors[1] = { error: false, msg: '' };
                        }
                        if (email === '') {
                            myerrors[2] = { error: true, msg: 'Email cannot be empty!' }
                            hasError = true;
                        }
                        else if (!EmailValidator.validate(email)) {
                            myerrors[2] = { error: true, msg: 'Not a valid email!' }
                            hasError = true;
                        }
                        else {
                            myerrors[2] = { error: false, msg: '' };
                        }
                        setErrors(myerrors);
                        if (!hasError) {
                            let filtered = langs.filter((i) => (i !== null)) as Array<Language>;
                            let res = await auth().createUserWithEmailAndPassword(email, password);
                            let fuser: FirebaseUser = { email: email, username: username, preferredLanguages: filtered, poems: [], followers: [], following: [] }
                            let res2 = await firestore().collection('users').add(fuser);
                            let res3 = await firestore().collection('users').doc(res2.id).update({id: res2.id});
                            let user: User = {...fuser, id: res2.id};

                            props.setUser(user);
                            props.navigation.navigate('Home');
                            /**
                             * Reset State since logging out returns to last page in the drawer stack
                             */
                            setUsername('');
                            setPassword('');
                            setEmail('');
                            setLoading(false);
                            setLangs(['English', null, null]);
                        }
                        else {
                            setLoading(false);
                        }
                    }}
                >Sign up</Button>
                :
                <ActivityIndicator size={50} />
            }
            <IconButton onPress={() => props.navigation.navigate('Enterance')} style={styles.arrowBack} icon="arrow-left" size={32} />
        </ScrollView>
    )
}

export default connector(Signup);

const styles = StyleSheet.create({
    container: {
        paddingTop: 40,
        paddingBottom: 16,
        paddingHorizontal: 24,
        justifyContent: 'center'
    },
    title: {
        paddingTop: 2,
        textAlign: 'center',
        fontSize: 32,
        marginBottom: 32
    },
    textinput: {
        marginBottom: 16
    },
    textinputLast: {
        marginBottom: 20
    },
    button: {
        paddingVertical: 6
    },
    errorText: {
        fontSize: 13,
        color: 'red',
        marginTop: 4,
        marginBottom: 4
    },
    langText: {
        marginLeft: 4,
        marginBottom: 2,
        fontSize: 14,
        color: '#666'
    },
    langContainer: {
        borderColor: '#888',
        marginBottom: 24,
        borderWidth: 1,
        borderRadius: 12
    },
    helperText: {
        fontSize: 13,
        textAlign: 'right',
        marginTop: 4,
        marginBottom: 24
    },
    arrowBack: {
        position: 'absolute',
        left: 2,
        top: 4
    }
})
