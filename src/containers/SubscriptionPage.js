import { connect } from "react-redux";
import SubscriptionPage from "../components/SubscriptionPage";
import {
	cancelSubscription,
	closeCancelSubscriptionModal,
	getAllSubscriptions,
	openCancelSubscriptionModal,
} from "../actions/subscriptions";
import { getAllProducts } from "../actions/products";
import { getProductGroups } from "../actions/productGroups";
import { getOrders } from "../actions/orders";
import _isUndefined from "lodash/isUndefined";
import { retrieveSites } from "../actions/sites";
import isEmpty from "lodash/isEmpty";
import { capitalizeFirstLetter } from "../functions/stringHelpers";
import { getProductGroupsByParentSlug, getProductsByProductGroupId } from "../functions/productGroups";
import { sortPluginsByPopularity } from "../functions/products";


/* eslint-disable require-jsdoc */
/* eslint-disable-next-line max-statements */
export const mapStateToProps = ( state, ownProps ) => {
	const selectedSubscriptionId = ownProps.match.params.id;

	const selectedSubscription = state.entities.subscriptions.byId[ selectedSubscriptionId ];


	if ( _isUndefined( selectedSubscription ) || state.ui.subscriptions.requesting || state.ui.sites.retrievingSites ) {
		return {
			isLoading: true,
		};
	}

	let orders = selectedSubscription.orders.map( order => state.entities.orders.byId[ order ] );

	// If some orders are undefined we are still waiting for some data.
	if ( orders.filter( order => ! ! order ).length !== orders.length ) {
		return {
			isLoading: true,
		};
	}

	orders = orders
		.map( order => {
			return {
				id: order.id,
				orderNumber: order.invoiceNumber,
				date: new Date( order.date ),
				total: order.totalAmount,
				status: capitalizeFirstLetter( order.status ),
				items: order.items,
				currency: order.currency,
			};
		} )
		.filter( ( order ) => {
			return order.status === "Completed" || order.status === "Processing" || order.status === "Refunded";
		} );

	let sites = [];
	const siteIds = state.entities.sites.allIds;
	if ( isEmpty( siteIds ) === false ) {
		sites = siteIds
			.map( siteId => state.entities.sites.byId[ siteId ] )
			.filter( site => site.subscriptions.includes( selectedSubscription.id ) );
	}

	// Get subscriptions that are connected to the same order in WooCommerce.
	let connectedSubscriptions = [];
	const subscriptionIds = state.entities.subscriptions.allIds;
	if ( isEmpty( subscriptionIds ) === false ) {
		connectedSubscriptions = subscriptionIds
			.map( subscriptionId => state.entities.subscriptions.byId[ subscriptionId ] )
			.filter( subscription => subscription.sourceId === selectedSubscription.sourceId )
			.filter( subscription => subscription.id !== selectedSubscription.id );
	}

	// Gather sites that use one or more of the connected subscriptions.
	let connectedSubscriptionsSites = [];
	if ( isEmpty( siteIds ) === false ) {
		connectedSubscriptionsSites = siteIds
			.map( siteId => state.entities.sites.byId[ siteId ] )
			.filter( site =>
				site.subscriptions.some( subId =>
					connectedSubscriptions.some( connectedSubscription => connectedSubscription.id === subId )
				)
			);
	}

	const allProducts = state.entities.products.allIds.map( ( productId ) => state.entities.products.byId[ productId ] );
	const allProductGroups = state.entities.productGroups.allIds.map( ( productGroupId ) => state.entities.productGroups.byId[ productGroupId ] );

	let downloads = [];
	const pluginProductGroups = selectedSubscription.product.productGroups;

	// If at least one productGroup doesn't have a parent.
	if ( pluginProductGroups.some( productGroup => productGroup.parentId === null ) ) {
		let products = pluginProductGroups
		// Retrieve the child product groups for the parent product group.
			.flatMap( productGroup => getProductGroupsByParentSlug( productGroup.slug, allProductGroups ) )

			// Retrieve the products for the child product groups.
			.flatMap( productGroup => getProductsByProductGroupId( productGroup.id, allProducts ) )
			.filter( product => product.sourceShopId === 1 );

		products = sortPluginsByPopularity( products );
		downloads = products.map( product => {
			return { name: product.name, file: product.downloads[ 0 ].file ? product.downloads[ 0 ].file : "" };
		} );
	} else {
		const selectedProduct = selectedSubscription.product;
		downloads = [ { name: selectedProduct.name, file: selectedProduct.downloads[ 0 ].file ? selectedProduct.downloads[ 0 ].file : "" } ];
	}

	const cancelSubscriptionState = {
		cancelModalOpen: state.ui.subscriptionsCancel.modalOpen,
		cancelLoading: state.ui.subscriptionsCancel.loading,
		cancelSuccess: state.ui.subscriptionsCancel.success,
		cancelError: state.ui.subscriptionsCancel.error,
	};

	return Object.assign( {}, {
		subscription: selectedSubscription,
		orders,
		sites,
		downloads,
		connectedSubscriptions,
		connectedSubscriptionsSites,
	}, cancelSubscriptionState );
};

export const mapDispatchToProps = ( dispatch ) => {
	return {
		loadData: () => {
			// Fetch required model data.
			dispatch( getOrders() );
			dispatch( getAllSubscriptions() );
			dispatch( retrieveSites() );
			dispatch( getAllProducts() );
			dispatch( getProductGroups() );
		},
		cancelSubscription: ( subscriptionId, shopId ) => {
			dispatch( cancelSubscription( subscriptionId, shopId ) );
		},
		openCancelModal: () => {
			dispatch( openCancelSubscriptionModal() );
		},
		closeCancelModal: () => {
			dispatch( closeCancelSubscriptionModal() );
		},
	};
};

const SubscriptionsPageContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)( SubscriptionPage );

export default SubscriptionsPageContainer;
