import React from "react";
import AnimatedLoader from "./Loader";
import Header from "./SubscriptionHeader";
import SubscriptionDetails from "./SubscriptionDetails";
import { Link } from "react-router-dom";
import { RoundBackButton } from "./RoundButton";

/**
 * Returns the rendered SubscriptionPage component.
 *
 * @param {Object} props The props to use.
 *
 * @returns {ReactElement} The rendered SubscriptionPage component.
 */
class SubscriptionPage extends React.Component {
	render() {
		if ( this.props.isLoading ) {
			return <AnimatedLoader />;
		}

		let subscription = this.props.subscription;

		return <section>
			<Link to={ "/account/subscriptions" } >
				<RoundBackButton />
			</Link>
			<Header
				name={subscription.name}
				byline={subscription.limit + " site subscription"}
				description={subscription.product.description}
				image={subscription.product.icon} />
			<SubscriptionDetails
				startDate={new Date( subscription.startDate )}
				nextBilling={new Date( subscription.nextPayment )}
				endDate={new Date( subscription.endDate )}
				max={subscription.limit}
				current={1}
				invoices={this.props.invoices}
				onAddSite={this.props.onAddSite}
				onShop={this.props.onShop}
				onCancel={this.props.onCancel}
				onInvoiceDownload={this.props.onInvoiceDownload}
			/>
		</section>;
	}
}

SubscriptionPage.propTypes = {
	isLoading: React.PropTypes.bool,
	subscription: React.PropTypes.object,
	invoices: React.PropTypes.array,
	onAddSite: React.PropTypes.func,
	onShop: React.PropTypes.func,
	onCancel: React.PropTypes.func,
	onInvoiceDownload: React.PropTypes.func,
};

SubscriptionPage.defaultProps = {
	isLoading: false,
};

export default SubscriptionPage;
