/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {AlertLevels} from "@wso2is/core/models";
import {addAlert} from "@wso2is/core/store";
import {useTrigger} from "@wso2is/forms";
import {Heading, LinkButton, PrimaryButton, Steps} from "@wso2is/react-components";
import _ from "lodash";
import React, {FunctionComponent, ReactElement, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Grid, Icon, Modal} from "semantic-ui-react";
import {createApplication} from "../../../api";
import {history} from "../../../helpers";
import {
    AuthProtocolMetaListItemInterface,
    FederatedAuthenticatorListItemInterface,
    FederatedAuthenticatorMetaInterface,
    IdentityProviderTemplateListItemInterface,
    MainApplicationInterface,
    SupportedAuthenticators,
    SupportedQuickStartTemplates
} from "../../../models";

import {GeneralSettingsWizardForm} from "./general-settings-wizard-form";
import {WizardSummary} from "./wizard-summary";
import {AppState} from "../../../store";
import {ApplicationConstants} from "../../../constants";
import {AuthenticatorFormFactory} from "../forms/authenticator-form-factory";
import {IdentityProviderWizardStepIcons} from "../../../configs";
import {IdentityProviderManagementUtils} from "../../../utils/identity-provider-management-utils";
import {AuthenticatorsMeta} from "../meta/authenticators.meta";

/**
 * Proptypes for the identity provider creation wizard component.
 */
interface IdentityProviderCreateWizardPropsInterface {
    currentStep?: number;
    title: string;
    closeWizard: () => void;
    template: IdentityProviderTemplateListItemInterface;
    subTitle?: string;
}

/**
 * Interface for the wizard state.
 */
interface WizardStateInterface {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [ key: string ]: any;
}

/**
 * Interface for the wizard steps.
 */
interface WizardStepInterface {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    title: string;
}

/**
 * Enum for wizard steps form types.
 *
 * @readonly
 * @enum {string}
 */
enum IdentityProviderCreateWizardStepTypes {
    GENERAL_SETTINGS = "generalSettings",
    AUTHENTICATOR_SETTINGS = "federatedAuthenticatorSettings",
    SUMMARY = "summary"
}

/**
 * Identity provider creation wizard component.
 *
 * @param {IdentityProviderCreateWizardPropsInterface} props - Props injected to the component.
 * @return {React.ReactElement}
 */
export const IdentityProviderCreateWizard: FunctionComponent<IdentityProviderCreateWizardPropsInterface> = (
    props: IdentityProviderCreateWizardPropsInterface
): ReactElement => {

    const {
        closeWizard,
        currentStep,
        title,
        subTitle,
        template
    } = props;

    const [ wizardSteps, setWizardSteps ] = useState<WizardStepInterface[]>(undefined);
    const [ isSelectionHidden, setIsSelectionHidden ] = useState<boolean>(false);
    const [ wizardState, setWizardState ] = useState<WizardStateInterface>(undefined);
    const [ partiallyCompletedStep, setPartiallyCompletedStep ] = useState<number>(undefined);
    const [ currentWizardStep, setCurrentWizardStep ] = useState<number>(currentStep);
    const [ templateSettings, setTemplateSettings ] = useState<MainApplicationInterface>(undefined);

    const dispatch = useDispatch();

    const availableAuthenticators = useSelector((state: AppState) => state.identityProvider.meta.authenticators);

    const [ submitGeneralSettings, setSubmitGeneralSettings ] = useTrigger();
    const [ submitAuthenticator, setSubmitAuthenticator ] = useTrigger();
    const [ finishSubmit, setFinishSubmit ] = useTrigger();
    const [ triggerProtocolSelectionSubmit, setTriggerProtocolSelectionSubmit ] = useState<boolean>(false);

    /**
     * Creates a new application.
     *
     * @param {MainApplicationInterface} application - The application to be created.
     */
    const createNewApplication = (application: MainApplicationInterface): void => {
        createApplication(application)
            .then((response) => {
                dispatch(addAlert({
                    description: "Successfully created the application",
                    level: AlertLevels.SUCCESS,
                    message: "Creation successful"
                }));

                // The created resource's id is sent as a location header.
                // If that's available, navigate to the edit page.
                if (!_.isEmpty(response.headers.location)) {
                    const location = response.headers.location;
                    const createdAppID = location.substring(location.lastIndexOf("/") + 1);

                    history.push(ApplicationConstants.PATHS.get("APPLICATION_EDIT").replace(":id",
                        createdAppID));

                    return;
                }

                // Fallback to applications page, if the location header is not present.
                history.push(ApplicationConstants.PATHS.get("APPLICATIONS"));
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.description) {
                    dispatch(addAlert({
                        description: error.response.data.description,
                        level: AlertLevels.ERROR,
                        message: "Application Create Error"
                    }));

                    return;
                }

                dispatch(addAlert({
                    description: "An error occurred while creating the application",
                    level: AlertLevels.ERROR,
                    message: "Creation Error"
                }));
            });
    };

    /**
     * Navigates to the next wizard step.
     */
    const navigateToNext = (): void => {
        let step = currentWizardStep;

        if (isSelectionHidden) {
            step = currentWizardStep + 1;
        }

        switch (step) {
            case 0:
                setSubmitGeneralSettings();
                break;
            case 1:
                setSubmitAuthenticator();
                break;
            case 2:
                setFinishSubmit();
                break;
            default:
                break;
        }
    };

    /**
     * Navigates to the previous wizard step.
     */
    const navigateToPrevious = (): void => {
        setPartiallyCompletedStep(currentWizardStep);
    };

    /**
     * Handles wizard step submit.
     *
     * @param values - Forms values to be stored in state.
     * @param {IdentityProviderCreateWizardStepTypes} formType - Type of the form.
     */
    const handleWizardFormSubmit = (values: any, formType: IdentityProviderCreateWizardStepTypes): void => {
        setCurrentWizardStep(currentWizardStep + 1);
        setWizardState(_.merge(wizardState, {[formType]: values}));

        // if (formType === WizardStepsFormTypes.PROTOCOL_SELECTION) {
        //     loadTemplate(template?.id, values.id);
        // }
    };

    /**
     * Generates a summary of the wizard.
     */
    const generateWizardSummary = (): MainApplicationInterface => {
        if (!wizardState) {
            return;
        }

        let summary = {};

        for (const [ key, value ] of Object.entries(wizardState)) {
            if (key === IdentityProviderCreateWizardStepTypes.AUTHENTICATOR_SETTINGS) {
                continue;
            }

            summary = {
                ...summary,
                ...value
            };
        }

        return _.merge(_.cloneDeep(templateSettings), summary);
    };

    /**
     * Handles the final wizard submission.
     *
     * @param application - Application data.
     */
    const handleWizardFormFinish = (application: any): void => {
        // if (wizardState[ WizardStepsFormTypes.FEDERATED_AUTHENTICATOR_SETTINGS ].id === SupportedAuthProtocolTypes.OIDC) {
        //     delete application.inboundProtocolConfiguration.saml;
        // } else if (wizardState[ WizardStepsFormTypes.FEDERATED_AUTHENTICATOR_SETTINGS ].id === SupportedAuthProtocolTypes.SAML) {
        //     delete application.inboundProtocolConfiguration.oidc;
        // }
        //
        // createNewApplication(application);
    };
    //
    // /**
    //  * Resolves the set of selectable inbound protocols.
    //  *
    //  * @return {AuthProtocolMetaListItemInterface[]} List of selectable inbound protocols.
    //  */
    // const resolveSelectableInboundProtocols = (): AuthProtocolMetaListItemInterface[] => {
    //     return availableAuthenticators.filter((protocol) => {
    //         // return template.protocols.includes(protocol.id as SupportedAuthProtocolTypes);
    //     })
    // };

    /**
     * Called when modal close event is triggered.
     */
    const handleWizardClose = (): void => {
        closeWizard();
    };

    const [ authenticatorDetails, setAuthenticatorDetails ] = useState<FederatedAuthenticatorListItemInterface>({
        name: "",
        isDefault: false,
        isEnabled: false,
        authenticatorId: "",
        properties: []
    });

    const [ authenticatorMeta, setAuthenticatorMeta ] = useState<FederatedAuthenticatorMetaInterface>({
        name: SupportedAuthenticators.NONE,
        displayName: "",
        authenticatorId: "",
        properties: []
    });

    const handleFederatedAuthenticatorConfigs = (): boolean => {
        return true;
    };

    /**
     * Resolves the step content.
     *
     * @return {React.ReactElement} Step content.
     */
    const resolveStepContent = (): ReactElement => {
        let step = currentWizardStep;

        if (isSelectionHidden) {
            step = currentWizardStep + 1;
        }

        switch (step) {
            case 0:
                return (
                    <GeneralSettingsWizardForm
                        triggerSubmit={ submitGeneralSettings }
                        initialValues={ wizardState && wizardState[
                            IdentityProviderCreateWizardStepTypes.GENERAL_SETTINGS ] }
                        onSubmit={ (values): void => handleWizardFormSubmit(values,
                            IdentityProviderCreateWizardStepTypes.GENERAL_SETTINGS) }
                    />
                );
            case 1:
                if (wizardState && wizardState[ IdentityProviderCreateWizardStepTypes.AUTHENTICATOR_SETTINGS ]) {
                    if (wizardState[IdentityProviderCreateWizardStepTypes.AUTHENTICATOR_SETTINGS].id ===
                        SupportedQuickStartTemplates.GOOGLE) {
                        return (
                            <AuthenticatorFormFactory
                                metadata={ authenticatorMeta }
                                initialValues={ authenticatorDetails }
                                onSubmit={ handleFederatedAuthenticatorConfigs }
                                type={ SupportedAuthenticators.GOOGLE }
                            />
                            // <GoogleTemplateSettingsWizardForm
                            //     triggerSubmit={ submitOAuth }
                            //     templateType={ template?.id }
                            //     initialValues={ wizardState && wizardState[ WizardStepsFormTypes.PROTOCOL_SETTINGS ] }
                            //     onSubmit={ (values): void => handleWizardFormSubmit(values,
                            //         WizardStepsFormTypes.PROTOCOL_SETTINGS) }
                            // />
                        )
                    }
                }

                return null;
            case 2:
                return (
                    <WizardSummary
                        triggerSubmit={ finishSubmit }
                        summary={ generateWizardSummary() }
                        onSubmit={ handleWizardFormFinish }
                    />
                )
        }
    };

    const STEPS: WizardStepInterface[] = [
        {
            icon: IdentityProviderWizardStepIcons.general,
            title: "General settings"
        },
        {
            icon: IdentityProviderWizardStepIcons.authenticatorConfig,
            title: "Authenticator"
        },
        {
            icon: IdentityProviderWizardStepIcons.summary,
            title: "Summary"
        }
    ];

    /**
     * Loads the identity provider authenticators on initial component load.
     */
    useEffect(() => {
        if (!_.isEmpty(availableAuthenticators)) {
            return;
        }
        IdentityProviderManagementUtils.getAuthenticators(AuthenticatorsMeta);
    }, []);

    /**
     * Called when `availableAuthenticators` are changed.
     */
    useEffect(() => {
        if (!(template.authenticators instanceof Array)) {
            throw new Error("Protocols has to be in the form of an array.")
        }

        // // Set the default selected protocol to the first.
        // setWizardState(_.merge(wizardState,
        //     {
        //         [ WizardStepsFormTypes.PROTOCOL_SELECTION ]: [ ...availableAuthenticators ]
        //             .find((protocol) => protocol.id === template.protocols[ 0 ])
        //     }));

        // // If there is only one supported protocol for the template, set is as selected
        // // and skip the protocol selection step.
        // if (template.protocols instanceof Array && template.protocols.length === 1) {
        //     // Load the template for the default selected template.
        //     loadTemplate(template?.id, template.protocols[0]);
        //
        //     setIsSelectionHidden(true);
        //     setWizardSteps(STEPS.slice(1));
        //
        //     return;
        // }

        setWizardSteps(STEPS);
    }, [ availableAuthenticators ]);

    /**
     * Sets the current wizard step to the previous on every `partiallyCompletedStep`
     * value change , and resets the partially completed step value.
     */
    useEffect(() => {
        if (partiallyCompletedStep === undefined) {
            return;
        }

        setCurrentWizardStep(currentWizardStep - 1);
        setPartiallyCompletedStep(undefined);
    }, [ partiallyCompletedStep ]);

    // /**
    //  * Called when protocol selection form trigger value is changed.
    //  */
    // useEffect(() => {
    //     if (triggerProtocolSelectionSubmit) {
    //         setTriggerProtocolSelectionSubmit(!triggerProtocolSelectionSubmit);
    //     }
    // }, [ triggerProtocolSelectionSubmit ]);

    return (
        (
            wizardSteps ? <Modal
                open={ true }
                className="wizard identity-provider-create-wizard"
                dimmer="blurring"
                onClose={ handleWizardClose }
                closeOnDimmerClick
                closeOnEscape
            >
                <Modal.Header className="wizard-header">
                    {title}
                    {subTitle && <Heading as="h6">{subTitle}</Heading>}
                </Modal.Header>
                <Modal.Content className="steps-container">
                    <Steps.Group header="Fill the basic information about your identity provider."
                                 current={ currentWizardStep }>
                        {wizardSteps.map((step, index) => (
                            <Steps.Step
                                key={ index }
                                icon={ step.icon }
                                title={ step.title }
                            />
                        ))}
                    </Steps.Group>
                </Modal.Content>
                <Modal.Content className="content-container" scrolling>{resolveStepContent()}</Modal.Content>
                <Modal.Actions>
                    <Grid>
                        <Grid.Row column={ 1 }>
                            <Grid.Column mobile={ 8 } tablet={ 8 } computer={ 8 }>
                                <LinkButton floated="left" onClick={ handleWizardClose }>Cancel</LinkButton>
                            </Grid.Column>
                            <Grid.Column mobile={ 8 } tablet={ 8 } computer={ 8 }>
                                {currentWizardStep < wizardSteps.length - 1 && (
                                    <PrimaryButton floated="right" onClick={ navigateToNext }>
                                        Next Step <Icon name="arrow right"/>
                                    </PrimaryButton>
                                )}
                                {currentWizardStep === wizardSteps.length - 1 && (
                                    <PrimaryButton floated="right" onClick={ navigateToNext }>Finish</PrimaryButton>
                                )}
                                {currentWizardStep > 0 && (
                                    <LinkButton floated="right" onClick={ navigateToPrevious }>
                                        <Icon name="arrow left"/> Previous step
                                    </LinkButton>
                                )}
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Modal.Actions>
            </Modal> : null
        )
    );
};

/**
 * Default props for the application creation wizard.
 */
IdentityProviderCreateWizard.defaultProps = {
    currentStep: 0
};
