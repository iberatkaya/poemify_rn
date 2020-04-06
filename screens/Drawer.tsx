import React from 'react'
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native'
import { IconButton } from 'react-native-paper';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { connect, ConnectedProps } from 'react-redux';
import { setUser } from '../redux/actions/User';
import { RootState } from '../redux/store';
import { User } from '../interfaces/User';

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
    nav: EnteranceScreenNavigationProp;
};

function Drawer(props: Props) {
    return (
        <View style={{ height: '100%' }}>
            <View style={{ height: 150, backgroundColor: 'blue' }}></View>
            <TouchableOpacity style={styles.itemRow}>
                <IconButton icon="email" size={20} color="#777" />
                <Text style={styles.text}>Feedback</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logout}
                onPress={() =>{
                    let user: User = {username: '', poems: [], preferredLanguages: [], followers: [], following: []}
                    props.setUser(user);
                    props.nav.navigate('Enterance');
                }}
            >
                <IconButton icon="logout" size={20} color="#777" />
                <Text style={styles.text}>Logout</Text>
            </TouchableOpacity>
        </View>
    )
}

export default connector(Drawer);


const styles = StyleSheet.create({
    itemRow: {
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingLeft: 17, 
        paddingVertical: 12
    },
    text: {
        fontSize: 14, 
        fontWeight: 'bold', 
        paddingLeft: 12, 
        color: '#000'
    },
    logout: {
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingLeft: 17, 
        paddingVertical: 12,
        position: 'absolute', 
        bottom: 0
    }
})