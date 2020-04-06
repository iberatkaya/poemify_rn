import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Card, Paragraph, Text, IconButton, Divider, Menu, Button, TouchableRipple } from 'react-native-paper';
import { Poem } from '../interfaces/Poem';
import { connect, ConnectedProps } from 'react-redux';
import { User } from '../interfaces/User';
import { updatePoem, deletePoem } from '../redux/actions/Poem';
import { updateUserPoem, deleteUserPoem } from '../redux/actions/User';
import { HomeStackParamList, ProfileStackParamList } from '../AppNav';
import { RootState } from '../redux/store';
import Toast from 'react-native-simple-toast';
import firestore from '@react-native-firebase/firestore';

type PoemCardScreenNavigationProp = StackNavigationProp<
    HomeStackParamList & ProfileStackParamList,
    'Home'
>;

const mapState = (state: RootState) => ({
    user: state.user,
    poems: state.poems
});

const mapDispatch = {
    updatePoem,
    updateUserPoem,
    deletePoem,
    deleteUserPoem
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {
    item: Poem;
    navigation: PoemCardScreenNavigationProp;
    full: boolean;
};

function PoemCard(props: Props) {
    const [menu, setMenu] = useState(false)
    let userLiked = () => {
        for (let i in props.item.likes) {
            if (props.item.likes[i].username === props.user.username) {
                return true;
            }
            return false;
        }
    }

    let _openMenu = () => setMenu(true);

    let _closeMenu = () => setMenu(false);


    return (
        <Card style={styles.cardContainer}
            onPress={() => {
                if (!props.full)
                    props.navigation.push('PoemDetail', { poem: props.item })
            }}
        >
            <View>
                <Card.Title titleStyle={styles.cardTitle} title={props.item.title} />
                {
                    props.user.username === props.item.author.username
                        ?
                        <View style={styles.menu}>
                            <Menu
                                visible={menu}
                                onDismiss={_closeMenu}
                                anchor={
                                    <IconButton icon="chevron-down" onPress={_openMenu} />
                                }
                            >
                                <Menu.Item onPress={async () => {
                                    try {
                                        let mypoems = [...props.user.poems];
                                        let myindex = mypoems.findIndex((i) => i.poemId === props.item.poemId && i.author.username === props.item.author.username);
                                        if (myindex === -1)
                                            throw "FIREBASE: An error occurred!";
                                        mypoems.splice(myindex);
                                        await firestore().collection('users').doc(props.user.id).update({ poems: mypoems });
                                        props.deleteUserPoem(props.item);
                                        props.deletePoem(props.item);
                                    }
                                    catch (e) {
                                        Toast.show("We're sorry but an error occurred :(")
                                        console.log(e);
                                    }
                                }} title="Delete" />
                                <Divider />
                            </Menu>
                        </View>
                        :
                        <View />
                }
            </View>
            <Divider style={{ marginBottom: 12 }} />
            <Card.Content>
                <Paragraph>{(props.item.body.split('\n').length > 8 && !props.full) ? props.item.body.split('\n').slice(0, 8).join('\n') + '\n...' : props.item.body}</Paragraph>
            </Card.Content>
            <Divider style={styles.divider} />
            <Card.Actions style={styles.actions} >
                <Paragraph
                    onPress={() => props.navigation.push('UserDetail', { profileUser: { id: props.item.author.id, username: props.item.author.username } })}
                    style={styles.author}>{props.item.author.username.length > 12 ? props.item.author.username.slice(0, 13) : props.item.author.username}</Paragraph>
                {userLiked() ? (
                    <IconButton
                        color="red"
                        icon="heart"
                        style={styles.icon}
                        size={20}
                        //@ts-ignore
                        onPress={async () => {
                            try {
                                let poem = props.item;
                                let myindex = poem.likes.findIndex((val) => val.username === props.user.username);
                                poem.likes.splice(myindex);

                                /**
                                 * Redux Operations
                                 */

                                props.updatePoem(poem);
                                if (poem.author.username === props.user.username) {
                                    props.updateUserPoem(poem);
                                }


                                /**
                                 * Firebase Operations
                                 */

                                let req = await firestore().collection('users').doc(props.item.author.id).get();
                                let userData = req.data() as User;

                                let index = userData.poems.findIndex((val) => val.poemId === props.item.poemId && val.author.username === props.item.author.username);
                                if (index === -1)
                                    throw "FIREBASE: An error occurred!";
                                userData.poems[index].likes = poem.likes;
                                await firestore().collection('users').doc(props.item.author.id).update({ poems: userData.poems });

                            } catch (e) {
                                Toast.show("We're sorry but an error occurred :(")
                                console.log(e);
                            }
                        }}
                    />
                ) : (
                        <IconButton
                            icon="heart-outline"
                            style={styles.icon}
                            size={20}
                            //@ts-ignore
                            onPress={async () => {
                                try {
                                    let poem = props.item;
                                    poem.likes.push({ id: props.user.id, username: props.user.username });

                                    /**
                                     * Redux Operations
                                     */

                                    props.updatePoem(poem);
                                    if (poem.author.username === props.user.username) {
                                        props.updateUserPoem(poem);
                                    }

                                    /**
                                     * Firebase Operations
                                     */

                                    let req = await firestore().collection('users').doc(props.item.author.id).get();
                                    let userData = req.data() as User;
                                    let index = userData.poems.findIndex((val) => val.poemId === props.item.poemId && val.author.username === props.item.author.username);
                                    if (index === -1)
                                        throw "FIREBASE: An error occurred!";
                                    userData.poems[index].likes = poem.likes;
                                    await firestore().collection('users').doc(props.item.author.id).update({ poems: userData.poems });
                                } catch (e) {
                                    Toast.show("We're sorry but an error occurred :(")
                                    console.log(e);
                                }
                            }}
                        />
                    )}
                <Text style={styles.likeText}>{props.item.likes.length}</Text>
            </Card.Actions>
        </Card>
    );
}

export default connector(PoemCard);

const styles = StyleSheet.create({
    cardContainer: {
        marginHorizontal: 8,
        marginVertical: 4,
    },
    cardTitle: {
        textAlign: 'center',
        fontSize: 22,
    },
    icon: {
        marginRight: 0,
    },
    menu: {
        position: 'absolute',
        right: 12
    },
    actions: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingVertical: 1,
        paddingHorizontal: 12
    },
    author: {
        fontSize: 15,
        color: '#555',
        textAlign: 'left',
        marginRight: 'auto'
    },
    divider: {
        height: 1,
        marginTop: 8,
    },
    likeText: {
        fontSize: 18,
    },
});
