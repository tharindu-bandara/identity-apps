/**
* Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
* WSO2 Inc. licenses this file to you under the Apache License,
* Version 2.0 (the 'License'); you may not use this file except
* in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied. See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import React, { useState, useRef } from "react";
import { ResourceList, LinkButton, PrimaryButton } from "@wso2is/react-components"
import { Claim, ExternalClaim, ClaimDialect, AlertLevels } from "../../models";
import { List, Modal } from "semantic-ui-react";
import { history } from "../../helpers";
import { deleteAClaim, deleteAnExternalClaim, deleteADialect } from "../../api";
import { useDispatch } from "react-redux";
import { addAlert } from "../../store/actions";
import { CopyInputField } from "@wso2is/react-components";
import { EDIT_LOCAL_CLAIMS_PATH, LOCAL_CLAIMS_PATH, EXTERNAL_CLAIMS_PATH } from "../../constants";

export enum ListType {
    LOCAL,
    EXTERNAL,
    DIALECT
}

interface ClaimsListPropsInterface {
    list: Claim[] | ExternalClaim[] | ClaimDialect[];
    localClaim: ListType;
    openEdit?: (id: string) => void;
    update: () => void;
    dialectID?: string;
}
export const ClaimsList = (props: ClaimsListPropsInterface): React.ReactElement => {

    const { list, localClaim, openEdit, update, dialectID } = props;

    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleteType, setDeleteType] = useState<ListType>(null);
    const [deleteID, setDeleteID] = useState<string>(null);

    const dispatch = useDispatch();

    const claimURIText = useRef([]);
    const copyButton = useRef([]);

    list?.forEach((element, index) => {
        claimURIText.current.push(claimURIText.current[index] || React.createRef());
        copyButton.current.push(copyButton.current[index] || React.createRef())
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isLocalClaim = (toBeDetermined: Claim[] | ExternalClaim[] | ClaimDialect[]): toBeDetermined is Claim[] => {
        return localClaim === ListType.LOCAL;
    }

    const isDialect = (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        toBeDetermined: Claim[] | ExternalClaim[] | ClaimDialect[]
    ): toBeDetermined is ClaimDialect[] => {
        return localClaim === ListType.DIALECT
    }

    const listContent = (content: any): React.ReactElement => (
        <List.Content>
            <List.Description className="list-item-meta">
                {content}
            </List.Description>
        </List.Content>
    );

    const closeDeleteConfirm = () => {
        setDeleteConfirm(false);
        setDeleteID(null);
        setDeleteType(null);
    }

    const deleteLocalClaim = (id: string) => {
        deleteAClaim(id).then(() => {
            update();
            closeDeleteConfirm();
            dispatch(addAlert(
                {
                    description: "The local claim has been deleted successfully!",
                    level: AlertLevels.SUCCESS,
                    message: "Local claim deleted successfully"
                }
            ));
        }).catch(error => {
            dispatch(addAlert(
                {
                    description: error?.description || "There was an error while deleting the local claim",
                    level: AlertLevels.ERROR,
                    message: error?.message || "Something went wrong"
                }
            ));
        })
    };

    const deleteExternalClaim = (dialectID: string, claimID: string) => {
        deleteAnExternalClaim(dialectID, claimID).then(() => {
            update();
            closeDeleteConfirm();
            dispatch(addAlert(
                {
                    description: "The external claim has been deleted successfully!",
                    level: AlertLevels.SUCCESS,
                    message: "External claim deleted successfully"
                }
            ));
        }).catch(error => {
            dispatch(addAlert(
                {
                    description: error?.description || "There was an error while deleting the external claim",
                    level: AlertLevels.ERROR,
                    message: error?.message || "Something went wrong"
                }
            ));
        })
    };

    const deleteDialect = (dialectID: string) => {
        deleteADialect(dialectID).then(() => {
            update();
            closeDeleteConfirm();
            dispatch(addAlert(
                {
                    description: "The dialect has been deleted successfully!",
                    level: AlertLevels.SUCCESS,
                    message: "Dialect deleted successfully"
                }
            ));
        }).catch(error => {
            dispatch(addAlert(
                {
                    description: error?.description || "There was an error while deleting the dialect",
                    level: AlertLevels.ERROR,
                    message: error?.message || "Something went wrong"
                }
            ));
        })
    };

    const showDeleteConfirm = (): React.ReactElement => {
        return (
            <Modal
                open={ deleteConfirm }
                onClose={ closeDeleteConfirm }
                size="mini"
                dimmer="blurring"
            >
                <Modal.Header>
                    Confirm Delete
                </Modal.Header>
                <Modal.Content>
                    This will completely delete the
                    {
                        deleteType === ListType.DIALECT
                            ? " Claim Dialect. "
                            : deleteType === ListType.EXTERNAL
                                ? " External Claim. "
                                : " Local Claim. "
                    }
                    Do you want to continue deleting it?
                </Modal.Content>
                <Modal.Actions>
                    <LinkButton onClick={ closeDeleteConfirm }>
                        Cancel
                    </LinkButton>
                    <PrimaryButton onClick={ () => {
                        switch (deleteType) {
                            case ListType.DIALECT:
                                deleteDialect(deleteID);
                                break;
                            case ListType.EXTERNAL:
                                deleteExternalClaim(dialectID, deleteID);
                                break;
                            case ListType.LOCAL:
                                deleteLocalClaim(deleteID);
                                break;
                        }
                    } }>
                        Delete
                    </PrimaryButton>
                </Modal.Actions>
            </Modal>
        )
    };

    const initDelete = (type: ListType, id: string) => {
        setDeleteType(type);
        setDeleteID(id);
        setDeleteConfirm(true);
    };

    return (
        <>
            {deleteConfirm ? showDeleteConfirm() : null}
            <ResourceList>
                {
                    isLocalClaim(list)
                        ? list?.map((claim: Claim, index: number) => {
                            return (
                                <ResourceList.Item
                                    key={ index }
                                    actions={ [
                                        {
                                            icon: "pencil alternate",
                                            onClick: () => {
                                                history.push(`${EDIT_LOCAL_CLAIMS_PATH}/${claim?.id}`)
                                            },
                                            popupText: "Edit",
                                            type: "button"
                                        },
                                        {
                                            icon: "trash alternate",
                                            onClick: () => { initDelete(ListType.LOCAL, claim?.id) },
                                            popupText: "Delete",
                                            type: "dropdown"
                                        }
                                    ] }
                                    descriptionColumnWidth={ 4 }
                                    metaColumnWidth={ 4 }
                                    actionsColumnWidth={ 4 }
                                    actionsFloated="right"
                                    itemHeader={ claim.displayName }
                                    metaContent={ [
                                        listContent(claim.description),
                                        listContent(
                                            <CopyInputField
                                                value={ claim ? claim.claimURI : "" }
                                                className="copy-field"
                                            />
                                        )
                                    ] }
                                />
                            )
                        })
                        : isDialect(list)
                            ? <>
                                <ResourceList.Item
                                    actions={ [
                                        {
                                            icon: "eye",
                                            onClick: () => {
                                                history.push(LOCAL_CLAIMS_PATH);
                                            },
                                            popupText: "View Local Claims",
                                            type: "button"
                                        }
                                    ] }
                                    actionsFloated="right"
                                    itemHeader={ "Local Dialect" }
                                />
                                {
                                    list?.map((dialect: ClaimDialect, index: number) => {
                                        return (
                                            <ResourceList.Item
                                                key={ index }
                                                actions={ [
                                                    {
                                                        icon: "eye",
                                                        onClick: () => {
                                                            history.push(`${EXTERNAL_CLAIMS_PATH}/${dialect.id}`);
                                                        },
                                                        popupText: "View Claims belonging to this dialect",
                                                        type: "button"
                                                    },
                                                    {
                                                        icon: "pencil alternate",
                                                        onClick: () => {
                                                            openEdit(dialect.id);
                                                        },
                                                        popupText: "Edit",
                                                        type: "button"
                                                    },
                                                    {
                                                        icon: "trash alternate",
                                                        onClick: () => { initDelete(ListType.DIALECT, dialect?.id) },
                                                        popupText: "Delete",
                                                        type: "dropdown"
                                                    }
                                                ] }
                                                actionsFloated="right"
                                                itemHeader={ dialect.dialectURI }
                                            />
                                        );
                                    })

                                }
                            </>
                            : list?.map((claim: ExternalClaim, index: number) => {
                                return (
                                    <ResourceList.Item
                                        key={ index }
                                        actions={ [
                                            {
                                                icon: "pencil alternate",
                                                onClick: () => {
                                                    openEdit(claim?.id);
                                                },
                                                popupText: "Edit",
                                                type: "button"
                                            },
                                            {
                                                icon: "trash alternate",
                                                onClick: () => { initDelete(ListType.EXTERNAL, claim?.id) },
                                                popupText: "Delete",
                                                type: "dropdown"
                                            }
                                        ] }
                                        actionsFloated="right"
                                        itemHeader={ claim.claimURI }
                                        metaContent={ listContent(claim.mappedLocalClaimURI) }
                                    />
                                )
                            })
                }
            </ResourceList>
        </>
    )
};
