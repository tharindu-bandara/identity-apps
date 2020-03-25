/**
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "semantic-ui-react";
import { EmptyPlaceholder } from "../../components/shared";
import { EmptyPlaceholderIllustrations, GlobalConfig } from "../../configs";

/**
 * 404 error page.
 *
 * @return {JSX.Element}
 */
export const PageNotFound = (): JSX.Element => {
    const { t } = useTranslation();
    return (
        <EmptyPlaceholder
            action={ (
                <Button
                    className="link-button"
                    as={ Link }
                    to={ GlobalConfig.appHomePath }
                >
                    { t("devPortal:placeholders.404.action") }
                </Button>
            ) }
            image={ EmptyPlaceholderIllustrations.pageNotFound }
            imageSize="tiny"
            subtitle={ [
                t("devPortal:placeholders.404.subtitles.0"),
                t("devPortal:placeholders.404.subtitles.1")
            ] }
            title={ t("devPortal:placeholders.404.title") }
        />
    );
};
