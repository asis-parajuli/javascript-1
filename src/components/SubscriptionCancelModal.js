import PropTypes from "prop-types";
import React from "react";
import { defineMessages, FormattedMessage, injectIntl, intlShape } from "react-intl";
import styled from "styled-components";
import MyYoastModal from "./MyYoastModal";
import ButtonsContainer from "./general/ButtonsContainer";
import { LargeButton, LargeSecondaryButton } from "./Button";
import ErrorDisplay from "../errors/ErrorDisplay";
import ConnectedSubscriptionWarning from "./ConnectedSubscriptionWarning";

const messages = defineMessages( {
	ariaLabel: {
		id: "subscriptionCancel.modal.arialabel",
		defaultMessage: "Cancel subscription",
	},
	header: {
		id: "subscriptionCancel.modal.header",
		defaultMessage: "Cancel subscription?",
	},
	body: {
		id: "subscriptionCancel.modal.body",
		defaultMessage: "Are you sure you want to cancel this subscription? If you cancel, you will no longer receive support or security and functionality updates.",
	},
	activeSites: {
		id: "subscriptionCancel.modal.activeSites",
		defaultMessage: "You have {amount} active {amount, plural, one {site} other {sites}} using this subscription.",
	},
	cancel: {
		id: "subscriptionCancel.modal.cancel",
		defaultMessage: "Go back",
	},
	confirm: {
		id: "subscriptionCancel.modal.confirm",
		defaultMessage: "Confirm cancellation",
	},
	loading: {
		id: "subscriptionCancel.modal.loading",
		defaultMessage: "Cancelling subscription...",
	},
} );

const ActionButtonsContainer = styled( ButtonsContainer )`
	margin: 1em 0;
`;


const CancelSubscriptionContainer = styled.div`
	width:800px;
`;

class SubscriptionEditModal extends React.Component {
	/**
	 * Renders the component.
	 *
	 * @returns {ReactElement} The rendered component.
	 */
	render() {
		const confirmButtonText = this.props.loading ? messages.loading : messages.confirm;

		return (
			<MyYoastModal
				isOpen={ this.props.isOpen }
				onClose={ this.props.onClose }
				modalAriaLabel={ messages.ariaLabel }
			>
				<CancelSubscriptionContainer>
					<h1><FormattedMessage { ...messages.header } /></h1>
					<p>
						<FormattedMessage { ...messages.body } />
					</p>
					<p>
						<strong>
							<FormattedMessage
								{ ...messages.activeSites }
								values={ { amount: this.props.amountOfActiveSites } }
							/>
						</strong>
					</p>
					{ this.props.connectedSubscriptions.length > 0 &&
					<ConnectedSubscriptionWarning subscriptions={ this.props.connectedSubscriptions } /> }
					<ErrorDisplay error={ this.props.error } />
					<ActionButtonsContainer>
						<LargeSecondaryButton onClick={ this.props.onClose }>
							<FormattedMessage { ...messages.cancel } />
						</LargeSecondaryButton>
						<LargeButton
							type="submit"
							onClick={ this.props.cancelSubscription }
							enabledStyle={ this.props.loading === false }
						>
							<FormattedMessage { ...confirmButtonText } />
						</LargeButton>
					</ActionButtonsContainer>
				</CancelSubscriptionContainer>
			</MyYoastModal>
		);
	}
}

SubscriptionEditModal.propTypes = {
	className: PropTypes.string,
	intl: intlShape.isRequired,
	isOpen: PropTypes.bool,
	onClose: PropTypes.func.isRequired,
	cancelSubscription: PropTypes.func.isRequired,
	loading: PropTypes.bool.isRequired,
	error: PropTypes.object,
	amountOfActiveSites: PropTypes.number.isRequired,
	connectedSubscriptions: PropTypes.array,
};

SubscriptionEditModal.defaultProps = {
	isOpen: false,
	loading: false,
	error: null,
	connectedSubscriptions: [],
};

export default injectIntl( SubscriptionEditModal );
