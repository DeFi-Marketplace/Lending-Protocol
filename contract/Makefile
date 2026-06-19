build:
	cargo build --target wasm32-unknown-unknown --release

deploy-testnet: build
	soroban contract deploy \
		--wasm target/wasm32-unknown-unknown/release/stellar_p2p_lending.wasm \
		--network testnet

bindings-testnet: deploy-testnet
	soroban contract bindings typescript \
		--network testnet \
		--contract-id $$(soroban contract id --network testnet) \
		--output-dir ../frontend/src/contracts
