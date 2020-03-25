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

import {Field, Forms} from "@wso2is/forms";
import React, {FunctionComponent, ReactElement, useEffect, useState} from "react";
import {Button, Grid} from "semantic-ui-react";
import {FederatedAuthenticatorListItemInterface, FederatedAuthenticatorMetaInterface} from "../../../models";
import {FormValidation} from "@wso2is/validation";
import {URLInputComponent} from "../components";

/**
 * Proptypes for the Google authenticator form component.
 */
interface GoogleFormPropsInterface {
    metadata: FederatedAuthenticatorMetaInterface;
    initialValues: FederatedAuthenticatorListItemInterface;
    onSubmit: (values: any) => void;
}

/**
 * Constants for Google authenticator properties.
 */
enum GoogleAuthenticatorProperties {
    CLIENT_ID = "ClientId",
    CLIENT_SECRET = "ClientSecret",
    CALLBACK_URL = "CallbackUrl",
    ADDITIONAL_QUERY_PARAMETERS = "AdditionalQueryParameters"
}

/**
 * Google authenticator configurations form.
 *
 * @param {GoogleFormPropsInterface} props
 * @return { ReactElement }
 * @constructor
 */
export const GoogleAuthenticatorForm: FunctionComponent<GoogleFormPropsInterface> = (
    props: GoogleFormPropsInterface
): ReactElement => {

    const {
        metadata,
        initialValues,
        onSubmit
    } = props;

    const [callbackUrl, setCallbackUrl] = useState<string>("");
    const [showCallbackUrlError, setCallbackUrlError] = useState<boolean>(false);

    /**
     * Prepares form values for submit.
     *
     * @param values - Form values.
     * @return {any} Sanitized form values.
     */
    const updateConfiguration = (values: any): any => {
        const formValues = {
            properties: [
                {
                    key: GoogleAuthenticatorProperties.CLIENT_ID,
                    value: values.get(GoogleAuthenticatorProperties.CLIENT_ID)
                },
                {
                    key: GoogleAuthenticatorProperties.CLIENT_SECRET,
                    value: values.get(GoogleAuthenticatorProperties.CLIENT_SECRET)
                },
                {
                    key: GoogleAuthenticatorProperties.CALLBACK_URL,
                    value: values.get(GoogleAuthenticatorProperties.CALLBACK_URL)
                },
                {
                    key: GoogleAuthenticatorProperties.ADDITIONAL_QUERY_PARAMETERS,
                    value: values.get(GoogleAuthenticatorProperties.ADDITIONAL_QUERY_PARAMETERS)
                }
            ],
        };

        return {
            ...formValues,
            authenticatorId: initialValues.authenticatorId,
            isEnabled: initialValues.isEnabled,
            isDefault: initialValues.isDefault,
        };
    };

    useEffect(
        () => {
            setCallbackUrl(initialValues?.properties
                ?.find(property => property.key === GoogleAuthenticatorProperties.CALLBACK_URL)?.value);
        }, [initialValues]
    );

    return (
        <Forms
            onSubmit={ (values) => {
                onSubmit(updateConfiguration(values));
            } }
        >
            <Grid>
                <Grid.Row columns={ 1 }>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                        <Field
                            name={ GoogleAuthenticatorProperties.CLIENT_ID }
                            label="Client ID"
                            required={ true }
                            requiredErrorMessage="This is required"
                            placeholder="Enter Google IDP client identifier value"
                            type="text"
                            value={ initialValues?.properties
                                ?.find(property => property.key === GoogleAuthenticatorProperties.CLIENT_ID)?.value }
                        />
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row columns={ 1 }>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                        <Field
                            name={ GoogleAuthenticatorProperties.CLIENT_SECRET }
                            label="Client Secret"
                            required={ true }
                            requiredErrorMessage="This is required"
                            placeholder="Enter Google IDP client secret value"
                            type="text"
                            value={ initialValues?.properties?.find(property =>
                                property.key === GoogleAuthenticatorProperties.CLIENT_SECRET)?.value }
                        />
                    </Grid.Column>
                </Grid.Row>

                <URLInputComponent
                    urlState={ callbackUrl }
                    setURLState={ setCallbackUrl }
                    labelName={ "Callback Url" }
                    value={ initialValues?.properties
                        ?.find(property => property.key === GoogleAuthenticatorProperties.CALLBACK_URL)?.value }
                    placeholder={ "Enter callback url " }
                    validationErrorMsg={ "Please add valid URL" }
                    validation={ (value: string): boolean => {
                        return FormValidation.url(value);
                    } }
                    required={ false }
                    showError={ showCallbackUrlError }
                    setShowError={ setCallbackUrlError }
                    hint={ "This specifies the callback URL during the authentication with the Google" }
                />

                <Grid.Row columns={ 1 }>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                        <Field
                            name={ GoogleAuthenticatorProperties.ADDITIONAL_QUERY_PARAMETERS }
                            label="Additional Query Parameters"
                            required={ false }
                            requiredErrorMessage=""
                            placeholder="scope=openid email profile"
                            type="text"
                            value={ initialValues?.properties?.find(property =>
                                property.key === GoogleAuthenticatorProperties.ADDITIONAL_QUERY_PARAMETERS)?.value }
                        />
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row columns={ 1 }>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                        <Button primary type="submit" size="small" className="form-button">
                            Update
                        </Button>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Forms>
    );
};
