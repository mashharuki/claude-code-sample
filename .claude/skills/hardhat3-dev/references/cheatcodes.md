# Hardhat 3 チートコード完全一覧

Hardhat 3はFoundry互換のチートコードをサポート。`vm.*` でアクセスする。
forge-stdの `Test` コントラクトを継承すると、ヘルパー関数も使える。

## アサーション系

| チートコード | 説明 |
|------------|------|
| `vm.expectRevert()` | 次のコールがリバートすることを期待 |
| `vm.expectRevert("message")` | 特定メッセージでリバートを期待 |
| `vm.expectRevert(selector)` | カスタムエラーセレクタでリバートを期待 |
| `vm.expectEmit()` | 次のイベント発火を期待 |
| `vm.expectEmit(t1, t2, t3, data)` | トピック/データの一致指定 |
| `vm.expectEmitAnonymous()` | 匿名イベントの発火を期待 |
| `vm.expectCall(addr, data)` | 特定コールの発生を期待 |
| `vm.expectCallMinGas(addr, data, gas)` | 最小ガスでのコールを期待 |
| `vm.expectCreate(addr)` | CREATEを期待 |
| `vm.expectCreate2(addr)` | CREATE2を期待 |
| `vm.expectSafeMemory(start, end)` | メモリ安全性チェック |

## 環境操作

### 送信者/アカウント
| チートコード | 説明 |
|------------|------|
| `vm.prank(addr)` | 次のコールのmsg.senderを変更 |
| `vm.startPrank(addr)` | 以降のmsg.senderを変更 |
| `vm.stopPrank()` | prank終了 |
| `vm.readCallers()` | コールスタック確認 |

### 残高/状態
| チートコード | 説明 |
|------------|------|
| `vm.deal(addr, amount)` | ETH残高設定 |
| `vm.etch(addr, code)` | コントラクトバイトコード設定 |
| `vm.store(addr, slot, value)` | ストレージスロット書き込み |
| `vm.load(addr, slot)` | ストレージスロット読み取り |
| `vm.setNonce(addr, nonce)` | ノンス設定 |
| `vm.resetNonce(addr)` | ノンスリセット |
| `vm.getNonce(addr)` | ノンス取得 |
| `vm.cloneAccount(source, target)` | アカウント複製 |
| `vm.setArbitraryStorage(addr)` | 任意ストレージ設定 |
| `vm.copyStorage(from, to)` | ストレージコピー |

### 時間/ブロック
| チートコード | 説明 |
|------------|------|
| `vm.warp(timestamp)` | ブロックタイムスタンプ設定 |
| `vm.roll(blockNumber)` | ブロック番号設定 |
| `vm.getBlockNumber()` | 現在のブロック番号取得 |
| `vm.getBlockTimestamp()` | 現在のタイムスタンプ取得 |
| `vm.fee(baseFee)` | ベースフィー設定 |
| `vm.txGasPrice(price)` | ガス価格設定 |
| `vm.coinbase(addr)` | block.coinbase設定 |
| `vm.difficulty(val)` | difficulty設定 |
| `vm.prevrandao(val)` | prevrandao設定 |
| `vm.chainId(id)` | チェーンID設定 |
| `vm.setBlockhash(block, hash)` | ブロックハッシュ設定 |
| `vm.blobBaseFee(fee)` | blob base fee設定 |
| `vm.blobhashes(hashes)` | blob hashes設定 |

### スナップショット
| チートコード | 説明 |
|------------|------|
| `vm.snapshot()` | 状態スナップショット取得 |
| `vm.revertTo(id)` | スナップショットに復元 |
| `vm.deleteSnapshot(id)` | スナップショット削除 |
| `vm.deleteSnapshots()` | 全スナップショット削除 |

### フォーク
| チートコード | 説明 |
|------------|------|
| `vm.createFork(url)` | フォーク作成 |
| `vm.createFork(url, block)` | 特定ブロックでフォーク |
| `vm.createSelectFork(url)` | フォーク作成して選択 |
| `vm.selectFork(forkId)` | フォーク切り替え |
| `vm.activeFork()` | アクティブなフォークID |
| `vm.rollFork(block)` | フォークのブロック変更 |
| `vm.transact(txHash)` | トランザクション実行 |
| `vm.makePersistent(addr)` | フォーク間でアドレスを永続化 |
| `vm.revokePersistent(addr)` | 永続化を取り消し |
| `vm.isPersistent(addr)` | 永続化状態の確認 |
| `vm.allowCheatcodes(addr)` | フォーク上でチートコード有効化 |

### モック
| チートコード | 説明 |
|------------|------|
| `vm.mockCall(addr, data, retdata)` | コール結果をモック |
| `vm.mockCallRevert(addr, data, revertData)` | リバートをモック |
| `vm.mockCalls(addr, data, retdatas[])` | 複数回のモック |
| `vm.mockFunction(addr, target, data)` | 関数をモック |
| `vm.clearMockedCalls()` | モッククリア |

### ガス計測
| チートコード | 説明 |
|------------|------|
| `vm.pauseGasMetering()` | ガス計測一時停止 |
| `vm.resumeGasMetering()` | ガス計測再開 |
| `vm.resetGasMetering()` | ガスカウンタリセット |
| `vm.lastCallGas()` | 前回コールのガス情報 |
| `vm.snapshotGas(name)` | ガススナップショット |

### 記録/トレース
| チートコード | 説明 |
|------------|------|
| `vm.record()` | コール記録開始 |
| `vm.stopRecord()` | コール記録停止 |
| `vm.recordLogs()` | ログ記録開始 |
| `vm.getRecordedLogs()` | 記録ログ取得 |
| `vm.startStateDiffRecording()` | 状態差分記録開始 |
| `vm.stopAndReturnStateDiff()` | 状態差分取得 |
| `vm.getStateDiff()` | 状態差分取得 |
| `vm.getStateDiffJson()` | JSON形式で状態差分取得 |
| `vm.pauseTracing()` | トレース一時停止 |
| `vm.resumeTracing()` | トレース再開 |
| `vm.accesses(addr)` | アクセスリスト取得 |

### ラベル
| チートコード | 説明 |
|------------|------|
| `vm.label(addr, name)` | アドレスにラベル付け |
| `vm.getLabel(addr)` | ラベル取得 |

## 外部/ファイル系

### 環境変数
| チートコード | 説明 |
|------------|------|
| `vm.envBool(key)` | bool型環境変数 |
| `vm.envUint(key)` | uint型環境変数 |
| `vm.envInt(key)` | int型環境変数 |
| `vm.envAddress(key)` | address型環境変数 |
| `vm.envString(key)` | string型環境変数 |
| `vm.envBytes(key)` | bytes型環境変数 |
| `vm.envBytes32(key)` | bytes32型環境変数 |
| `vm.envOr(key, default)` | デフォルト付き環境変数 |
| `vm.setEnv(key, value)` | 環境変数設定 |
| `vm.envExists(key)` | 環境変数存在確認 |

### ファイル操作
fsPermissionsの設定が必要。
| チートコード | 説明 |
|------------|------|
| `vm.readFile(path)` | ファイル読み取り |
| `vm.writeFile(path, data)` | ファイル書き込み |
| `vm.fsMetadata(path)` | ファイルメタデータ |
| `vm.projectRoot()` | プロジェクトルート |

### JSON/TOML
| チートコード | 説明 |
|------------|------|
| `vm.parseJson(json)` | JSON解析 |
| `vm.parseJsonAddress(json, key)` | JSON→address |
| `vm.parseJsonBool(json, key)` | JSON→bool |
| `vm.parseJsonUint(json, key)` | JSON→uint |
| `vm.parseJsonString(json, key)` | JSON→string |
| `vm.parseJsonKeys(json, key)` | JSONキー取得 |
| `vm.serializeJson(obj, key, val)` | JSONシリアライズ |
| `vm.writeJson(data, path)` | JSONファイル書き込み |
| `vm.parseToml(toml)` | TOML解析 |
| `vm.writeToml(data, path)` | TOMLファイル書き込み |
| `vm.keyExistsJson(json, key)` | JSONキー存在確認 |

### FFI
| チートコード | 説明 |
|------------|------|
| `vm.ffi(cmd[])` | 外部コマンド実行 |
| `vm.tryFfi(cmd[])` | エラーハンドリング付きFFI |

## 署名系

| チートコード | 説明 |
|------------|------|
| `vm.sign(privateKey, digest)` | ECDSA署名 |
| `vm.signCompact(privateKey, digest)` | コンパクト署名 |
| `vm.signP256(privateKey, digest)` | P-256署名 |

## ファザー系

| チートコード | 説明 |
|------------|------|
| `vm.assume(condition)` | ファズテストの前提条件 |
| `vm.assumeNoRevert()` | リバートしないパスを仮定 |

## ユーティリティ

### アドレス生成/計算
| チートコード | 説明 |
|------------|------|
| `vm.addr(privateKey)` | 秘密鍵→アドレス |
| `vm.randomAddress()` | ランダムアドレス |
| `vm.randomUint()` | ランダムuint |
| `vm.randomBytes(len)` | ランダムbytes |
| `vm.computeCreateAddress(deployer, nonce)` | CREATEアドレス計算 |
| `vm.computeCreate2Address(salt, hash, deployer)` | CREATE2アドレス計算 |

### 文字列操作
| チートコード | 説明 |
|------------|------|
| `vm.toString(val)` | 値→文字列 |
| `vm.toLowercase(str)` | 小文字化 |
| `vm.toUppercase(str)` | 大文字化 |
| `vm.trim(str)` | トリム |
| `vm.contains(str, sub)` | 部分文字列チェック |
| `vm.indexOf(str, sub)` | インデックス検索 |
| `vm.replace(str, from, to)` | 置換 |
| `vm.split(str, delim)` | 分割 |

### パース
| チートコード | 説明 |
|------------|------|
| `vm.parseAddress(str)` | 文字列→address |
| `vm.parseBool(str)` | 文字列→bool |
| `vm.parseUint(str)` | 文字列→uint |
| `vm.parseInt(str)` | 文字列→int |
| `vm.parseBytes(str)` | 文字列→bytes |
| `vm.parseBytes32(str)` | 文字列→bytes32 |

### エンコード
| チートコード | 説明 |
|------------|------|
| `vm.toBase64(data)` | Base64エンコード |
| `vm.toBase64URL(data)` | Base64URLエンコード |

### バイトコード取得
| チートコード | 説明 |
|------------|------|
| `vm.getCode(name)` | コントラクトの作成バイトコード |
| `vm.getDeployedCode(name)` | デプロイ済みバイトコード |

### その他
| チートコード | 説明 |
|------------|------|
| `vm.unixTime()` | 現在のUnix時間 |
| `vm.sleep(ms)` | スリープ |
| `vm.ensNamehash(name)` | ENSネームハッシュ |
| `vm.dumpState(path)` | 状態エクスポート |
| `vm.loadAllocs(path)` | アロケーション読み込み |
| `vm.sort(arr)` | 配列ソート |
| `vm.shuffle(arr)` | 配列シャッフル |
| `vm.skip(bool)` | テストスキップ |
