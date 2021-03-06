import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { User } from '../../interfaces/User';
import { connect, ConnectedProps } from 'react-redux';
import { setUser } from '../../redux/actions/User';
import { RootState } from '../../redux/store';
import firestore from '@react-native-firebase/firestore';
import { usersCollectionId } from '../../constants/collection';
import { ProfileStackParamList } from '../../AppNav';
import { FlatList } from 'react-native-gesture-handler';
import UserCard from '../../components/UserCard';
import { StackNavigationProp } from '@react-navigation/stack';

type EnteranceScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'BlockList'>;

const mapState = (state: RootState) => ({
    user: state.user,
    poems: state.poems,
});

const mapDispatch = {
    setUser,
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {
    navigation: EnteranceScreenNavigationProp;
};

function ChangeLang(props: Props) {
    const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let fetchBlockedUsers = async () => {
            try {
                setLoading(true);
                let res = await firestore()
                    .collection(usersCollectionId)
                    .where(
                        'docid',
                        'in',
                        props.user.blockedUsers.map((i) => i.docid)
                    )
                    .get();
                let data = res.docs.map((i) => i.data() as User);
                setBlockedUsers(data);
                setLoading(false);
            } catch (e) {
                setLoading(false);
                console.log(e);
            }
        };
        fetchBlockedUsers();
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {loading ? (
                <ActivityIndicator size={50} style={{ marginTop: 50 }} />
            ) : (
                <View>
                    {blockedUsers.length > 0 ? (
                        <FlatList
                            data={blockedUsers}
                            renderItem={({ item }) => <UserCard theUserProp={item} navigation={props.navigation} useForBlocking={true} />}
                        />
                    ) : (
                        <Text style={styles.text}>You have not blocked any users!</Text>
                    )}
                </View>
            )}
        </ScrollView>
    );
}

export default connector(ChangeLang);

const styles = StyleSheet.create({
    container: {
        paddingTop: 8,
        paddingBottom: 16,
        justifyContent: 'center',
    },
    text: {
        textAlign: 'center',
        fontSize: 20,
        paddingTop: 24,
        paddingHorizontal: 24,
    },
});
